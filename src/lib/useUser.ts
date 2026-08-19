import { useEffect, useState } from 'react';
import { UserData } from '../types';
import { identifyUser, resetAmplitude } from './amplitude';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createIdentity, getIdentityByEmail, isValidFid } from './identity';

const STORAGE_KEY = 'fiducia_demo_user';

const createEmptyUser = (userId: string): UserData => ({
  userId,
  firstName: '',
  lastName: '',
  status: 'prospect',
  totalInvested: 0,
  activeFunds: [],
  recurringContributionEnabled: false,
  recurringAmount: null,
  lastInvestmentDate: null,
  investorProfile: 'unknown',
  financialGoal: '',
  customerTenureDays: 0,
  hasEverInvested: false,
  daysSinceLastInvestment: null,
  accountCreatedAt: null,
});

const computeUserProperties = (user: UserData): UserData => {
  const now = Date.now();
  const hasEverInvested = user.totalInvested > 0 || user.hasEverInvested;

  let daysSinceLastInvestment: number | null = null;
  if (user.lastInvestmentDate) {
    const investmentTime = new Date(user.lastInvestmentDate).getTime();
    if (!Number.isNaN(investmentTime)) {
      daysSinceLastInvestment = Math.max(
        0,
        Math.floor((now - investmentTime) / (1000 * 60 * 60 * 24))
      );
    }
  }

  let customerTenureDays = user.customerTenureDays || 0;
  if (user.accountCreatedAt) {
    const createdTime = new Date(user.accountCreatedAt).getTime();
    if (!Number.isNaN(createdTime)) {
      customerTenureDays = Math.max(
        0,
        Math.floor((now - createdTime) / (1000 * 60 * 60 * 24))
      );
    }
  }

  return {
    ...user,
    hasEverInvested,
    daysSinceLastInvestment,
    customerTenureDays,
  };
};

const buildAmplitudeUserProperties = (user: UserData) => {
  const properties: Record<string, any> = {
    registration_status: user.status === 'prospect' ? 'not_completed' : 'completed',
    investor_status: user.status,
    investor_profile: user.investorProfile,
    customer_tenure_days: user.customerTenureDays,
    has_ever_invested: user.hasEverInvested,
    active_fund_count: user.activeFunds.length,
    total_invested_amount: user.totalInvested,
    last_investment_date: user.lastInvestmentDate,
    days_since_last_investment: user.daysSinceLastInvestment,
    recurring_contribution_enabled: user.recurringContributionEnabled,
  };

  if (user.financialGoal) {
    properties.financial_goal = user.financialGoal;
  }

  return properties;
};

export const useUser = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        try {
          const parsedUser = computeUserProperties(JSON.parse(stored) as UserData);
          setUser(parsedUser);

          if (parsedUser.status !== 'prospect' && isValidFid(parsedUser.userId)) {
            identifyUser(parsedUser.userId, buildAmplitudeUserProperties(parsedUser));
          }
        } catch (error) {
          console.error('Error reading local user profile', error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (!db) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const storedProfile = userSnap.exists()
          ? (userSnap.data() as UserData)
          : null;

        let fid: string | null = null;

        if (firebaseUser.email) {
          fid = await getIdentityByEmail(firebaseUser.email);

          // Recuperación segura: si Authentication ya existe pero la identidad
          // todavía no fue creada, se genera una sola vez mediante transacción.
          if (!fid) {
            fid = await createIdentity(firebaseUser.email, firebaseUser.uid);
          }
        }

        // Nunca usar firebaseUser.uid como user_id de Amplitude.
        if (!fid && storedProfile && isValidFid(storedProfile.userId)) {
          fid = storedProfile.userId;
        }

        if (!fid) {
          throw new Error('No fue posible resolver un FID válido para el usuario autenticado.');
        }

        const profile = computeUserProperties({
          ...(storedProfile || createEmptyUser(fid)),
          userId: fid,
          accountCreatedAt:
            storedProfile?.accountCreatedAt ||
            firebaseUser.metadata.creationTime ||
            null,
        });

        setUser(profile);

        // Repara perfiles creados por versiones anteriores que hayan guardado
        // accidentalmente el Firebase UID en lugar del FID.
        if (!storedProfile || storedProfile.userId !== fid) {
          await setDoc(
            userRef,
            {
              ...profile,
              userId: fid,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        if (profile.status !== 'prospect') {
          await identifyUser(fid, buildAmplitudeUserProperties(profile));
        }
      } catch (error) {
        console.error('Error fetching/resolving user profile', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveUser = async (newData: Partial<UserData>): Promise<UserData> => {
    let resolvedUserId = isValidFid(newData.userId)
      ? newData.userId
      : user && isValidFid(user.userId)
        ? user.userId
        : null;

    if (!resolvedUserId && auth?.currentUser?.email) {
      resolvedUserId = await getIdentityByEmail(auth.currentUser.email);

      if (!resolvedUserId) {
        resolvedUserId = await createIdentity(
          auth.currentUser.email,
          auth.currentUser.uid
        );
      }
    }

    if (!resolvedUserId) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const storedUser = JSON.parse(stored) as UserData;
          if (isValidFid(storedUser.userId)) {
            resolvedUserId = storedUser.userId;
          }
        } catch {
          // Continúa hacia el error explícito de identidad.
        }
      }
    }

    if (!resolvedUserId) {
      throw new Error(
        'No existe un FID válido. La identidad debe crearse antes de guardar el perfil.'
      );
    }

    const baseUser = user
      ? { ...user, userId: resolvedUserId }
      : createEmptyUser(resolvedUserId);

    const updatedUser = computeUserProperties({
      ...baseUser,
      ...newData,
      userId: resolvedUserId,
    });

    if (auth?.currentUser && db) {
      await setDoc(
        doc(db, 'users', auth.currentUser.uid),
        {
          ...updatedUser,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    }

    setUser(updatedUser);

    if (updatedUser.status !== 'prospect') {
      await identifyUser(
        updatedUser.userId,
        buildAmplitudeUserProperties(updatedUser)
      );
    }

    return updatedUser;
  };

  const clearUser = async () => {
    if (auth) {
      await auth.signOut();
    }

    resetAmplitude();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return { user, saveUser, clearUser, loading };
};
