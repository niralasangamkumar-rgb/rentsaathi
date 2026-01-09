import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const FAVORITES_COLLECTION = 'favorites';

export async function addFavorite(userId, listingId) {
  await addDoc(collection(db, FAVORITES_COLLECTION), {
    userId,
    listingId,
    createdAt: new Date().toISOString()
  });
}

export async function removeFavorite(userId, listingId) {
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where('userId', '==', userId),
    where('listingId', '==', listingId)
  );
  const snapshot = await getDocs(q);
  snapshot.forEach(async (docSnap) => {
    await deleteDoc(doc(db, FAVORITES_COLLECTION, docSnap.id));
  });
}

export async function getUserFavorites(userId) {
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().listingId);
}

export async function isFavorite(userId, listingId) {
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where('userId', '==', userId),
    where('listingId', '==', listingId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}
