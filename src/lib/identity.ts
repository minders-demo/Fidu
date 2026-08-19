import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function hashEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function checkEmailExists(email: string): Promise<boolean> {
  if (!db) {
    // Local storage fallback for demo
    const normalized = email.trim().toLowerCase();
    const existingUsers = JSON.parse(localStorage.getItem('fiducia_demo_users') || '{}');
    return !!existingUsers[normalized];
  }
  
  const hashed = await hashEmail(email);
  const docRef = doc(db, 'identity_registry', hashed);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

export async function createIdentity(email: string, firebaseUid: string): Promise<string> {
  const normalized = email.trim().toLowerCase();

  if (!db) {
    // Local storage fallback
    const existingUsers = JSON.parse(localStorage.getItem('fiducia_demo_users') || '{}');
    if (existingUsers[normalized]) {
      return existingUsers[normalized].userId;
    }
    
    let counter = parseInt(localStorage.getItem('fiducia_demo_user_counter') || '-1', 10);
    counter += 1;
    localStorage.setItem('fiducia_demo_user_counter', counter.toString());
    
    const fid = `FID_${counter.toString().padStart(6, '0')}`;
    
    existingUsers[normalized] = {
      userId: fid,
      firebaseUid,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('fiducia_demo_users', JSON.stringify(existingUsers));
    
    return fid;
  }

  const hashed = await hashEmail(email);
  const docRef = doc(db, 'identity_registry', hashed);
  const counterRef = doc(db, 'system', 'user_counter');

  return await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (docSnap.exists()) {
      return docSnap.data().userId; // Should not happen if we checked before, but safe to return
    }

    const counterSnap = await transaction.get(counterRef);
    let nextNumber = 0;
    if (counterSnap.exists() && counterSnap.data().lastAssignedNumber !== undefined) {
      nextNumber = counterSnap.data().lastAssignedNumber + 1;
    }

    const fid = `FID_${nextNumber.toString().padStart(6, '0')}`;

    transaction.set(counterRef, { lastAssignedNumber: nextNumber });
    transaction.set(docRef, {
      userId: fid,
      firebaseUid,
      emailNormalized: normalized, // Keeping the email normalized just in case
      createdAt: new Date().toISOString()
    });

    return fid;
  });
}

export async function getIdentityByEmail(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();

  if (!db) {
    const existingUsers = JSON.parse(localStorage.getItem('fiducia_demo_users') || '{}');
    return existingUsers[normalized]?.userId || null;
  }

  const hashed = await hashEmail(email);
  const docRef = doc(db, 'identity_registry', hashed);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().userId;
  }
  return null;
}
