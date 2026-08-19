import { useState, useEffect } from 'react';
import { UserData, UserStatus } from '../types';
import { identifyUser, resetAmplitude } from './amplitude';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getIdentityByEmail } from './identity';

const STORAGE_KEY = 'fiducia_demo_user';

const computeUserProperties = (user: UserData) => {
  const hasEverInvested = user.totalInvested > 0;
  let daysSinceLastInvestment = null;
  
  if (user.lastInvestmentDate) {
    const diffTime = Math.abs(new Date().getTime() - new Date(user.lastInvestmentDate).getTime());
    daysSinceLastInvestment = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    ...user,
    hasEverInvested,
    daysSinceLastInvestment
  };
};

export const useUser = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Fallback local storage for demo if Firebase not configured
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedUser = computeUserProperties(JSON.parse(stored));
        setUser(parsedUser);
        identifyUser(parsedUser.status !== 'prospect' ? parsedUser.userId : null, {
          registration_status: parsedUser.status !== 'prospect' ? 'registered' : 'unregistered',
          investor_status: parsedUser.status,
          total_invested_amount: parsedUser.totalInvested,
          active_fund_count: parsedUser.activeFunds.length,
          recurring_contribution_enabled: parsedUser.recurringContributionEnabled,
          investor_profile: parsedUser.investorProfile,
          financial_goal: parsedUser.financialGoal,
          customer_tenure_days: parsedUser.customerTenureDays,
          has_ever_invested: parsedUser.hasEverInvested,
          days_since_last_investment: parsedUser.daysSinceLastInvestment,
        });
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (db) {
          try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);
            
            let profile: UserData;
            if (userSnap.exists()) {
              profile = userSnap.data() as UserData;
            } else {
              // Retrieve FID
              let fid = firebaseUser.uid;
              if (firebaseUser.email) {
                const fetchedFid = await getIdentityByEmail(firebaseUser.email);
                if (fetchedFid) fid = fetchedFid;
              }

              profile = {
                userId: fid,
                firstName: '',
                lastName: '',
                status: 'prospect',
                totalInvested: 0,
                activeFunds: [],
                recurringContributionEnabled: false,
                recurringAmount: null,
                lastInvestmentDate: null,
                investorProfile: 'unknown' as any,
                financialGoal: '',
                customerTenureDays: 0,
                hasEverInvested: false,
                daysSinceLastInvestment: null
              };
            }
            
            const computed = computeUserProperties(profile);
            setUser(computed);
            
            identifyUser(computed.status !== 'prospect' ? computed.userId : null, {
              registration_status: computed.status !== 'prospect' ? 'registered' : 'unregistered',
              investor_status: computed.status,
              total_invested_amount: computed.totalInvested,
              active_fund_count: computed.activeFunds.length,
              recurring_contribution_enabled: computed.recurringContributionEnabled,
              investor_profile: computed.investorProfile,
              financial_goal: computed.financialGoal,
              customer_tenure_days: computed.customerTenureDays,
              has_ever_invested: computed.hasEverInvested,
              days_since_last_investment: computed.daysSinceLastInvestment,
            });
          } catch (error) {
            console.error("Error fetching user profile", error);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveUser = async (newData: Partial<UserData>) => {
    let currentUserFid = user ? user.userId : null;

    if (!currentUserFid && auth?.currentUser?.email) {
      currentUserFid = await getIdentityByEmail(auth.currentUser.email);
    }
    if (!currentUserFid) {
      // For anonymous/demo if Firebase offline
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
         currentUserFid = JSON.parse(stored).userId;
      }
      if (!currentUserFid) {
        currentUserFid = `FID_${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      }
    }

    setUser(prev => {
      let baseUser: UserData = prev || {
        userId: currentUserFid!,
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
        daysSinceLastInvestment: null
      };
      
      const updatedUser = computeUserProperties({ ...baseUser, ...newData });
      
      if (auth?.currentUser && db) {
        setDoc(doc(db, 'users', auth.currentUser.uid), {
          ...updatedUser,
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(console.error);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      }
      
      identifyUser(updatedUser.status !== 'prospect' ? updatedUser.userId : null, {
        registration_status: updatedUser.status !== 'prospect' ? 'registered' : 'unregistered',
        investor_status: updatedUser.status,
        total_invested_amount: updatedUser.totalInvested,
        active_fund_count: updatedUser.activeFunds.length,
        recurring_contribution_enabled: updatedUser.recurringContributionEnabled,
        investor_profile: updatedUser.investorProfile,
        financial_goal: updatedUser.financialGoal,
        customer_tenure_days: updatedUser.customerTenureDays,
        has_ever_invested: updatedUser.hasEverInvested,
        days_since_last_investment: updatedUser.daysSinceLastInvestment,
      });
      
      return updatedUser;
    });
  };

  const clearUser = async () => {
    // 1. Firebase Authentication signOut()
    if (auth) {
      await auth.signOut();
    }
    
    // 2 & 3. Limpiar identidades de Amplitude Experiment y Analytics
    resetAmplitude();

    // 4. Limpiar únicamente caches de sesión (Firestore mantiene los datos intactos)
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    
    // 6. Redirigir al Home
    window.location.href = '/';
  };

  return { user, saveUser, clearUser, loading };
};
