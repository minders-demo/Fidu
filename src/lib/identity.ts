import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

const LOCAL_USERS_KEY = 'fiducia_demo_users';
const LOCAL_COUNTER_KEY = 'fiducia_demo_user_counter';
const FID_PATTERN = /^FID_\d{6}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidFid(userId: unknown): userId is string {
  return typeof userId === 'string' && FID_PATTERN.test(userId);
}

export async function hashEmail(email: string): Promise<string> {
  const normalized = normalizeEmail(email);
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);

  if (!db) {
    const existingUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
    return Boolean(existingUsers[normalized]);
  }

  const hashed = await hashEmail(normalized);
  const identityRef = doc(db, 'identity_registry', hashed);
  const identitySnap = await getDoc(identityRef);

  return identitySnap.exists();
}

/**
 * Devuelve el FID existente para el correo o crea el siguiente consecutivo.
 * La transacción garantiza que dos altas concurrentes no reciban el mismo FID.
 */
export async function createIdentity(
  email: string,
  firebaseUid: string
): Promise<string> {
  const normalized = normalizeEmail(email);

  if (!db) {
    const existingUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
    const existing = existingUsers[normalized];

    if (existing?.userId && isValidFid(existing.userId)) {
      existingUsers[normalized] = {
        ...existing,
        firebaseUid,
      };
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(existingUsers));
      return existing.userId;
    }

    let counter = Number.parseInt(localStorage.getItem(LOCAL_COUNTER_KEY) || '-1', 10);
    if (Number.isNaN(counter)) counter = -1;

    const nextNumber = counter + 1;
    const fid = `FID_${nextNumber.toString().padStart(6, '0')}`;

    localStorage.setItem(LOCAL_COUNTER_KEY, nextNumber.toString());
    existingUsers[normalized] = {
      userId: fid,
      firebaseUid,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(existingUsers));

    return fid;
  }

  const hashed = await hashEmail(normalized);
  const identityRef = doc(db, 'identity_registry', hashed);
  const counterRef = doc(db, 'system', 'user_counter');

  return runTransaction(db, async transaction => {
    const identitySnap = await transaction.get(identityRef);

    if (identitySnap.exists()) {
      const existingUserId = identitySnap.data().userId;

      if (!isValidFid(existingUserId)) {
        throw new Error('La identidad existente no contiene un FID válido.');
      }

      transaction.set(
        identityRef,
        {
          firebaseUid,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return existingUserId;
    }

    const counterSnap = await transaction.get(counterRef);
    const lastAssignedNumber = counterSnap.exists()
      ? Number(counterSnap.data().lastAssignedNumber ?? -1)
      : -1;

    const nextNumber = lastAssignedNumber + 1;
    const fid = `FID_${nextNumber.toString().padStart(6, '0')}`;

    transaction.set(
      counterRef,
      { lastAssignedNumber: nextNumber },
      { merge: true }
    );

    transaction.set(identityRef, {
      userId: fid,
      firebaseUid,
      createdAt: new Date().toISOString(),
    });

    return fid;
  });
}

export async function getIdentityByEmail(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);

  if (!db) {
    const existingUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
    const userId = existingUsers[normalized]?.userId;
    return isValidFid(userId) ? userId : null;
  }

  const hashed = await hashEmail(normalized);
  const identityRef = doc(db, 'identity_registry', hashed);
  const identitySnap = await getDoc(identityRef);

  if (!identitySnap.exists()) return null;

  const userId = identitySnap.data().userId;
  return isValidFid(userId) ? userId : null;
}
