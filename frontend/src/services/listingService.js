import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

const LISTINGS_COLLECTION = 'listings';

export const categories = [
  { id: 'hostel', name: 'Hostel', icon: '🏨' },
  { id: 'pg', name: 'PG', icon: '🏠' },
  { id: 'room', name: 'Room', icon: '🚪' },
  { id: 'flat', name: 'Flat', icon: '🏢' },
  { id: 'commercial', name: 'Commercial Space', icon: '🏪' },
  { id: 'bike', name: 'Bike Rent', icon: '🏍️' },
  { id: 'car', name: 'Car Rent', icon: '🚗' }
];

export async function uploadImages(files) {
  const urls = [];
  for (const file of files) {
    const imageRef = ref(storage, `listings/${uuidv4()}-${file.name}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    urls.push(url);
  }
  return urls;
}

export async function deleteImages(urls) {
  for (const url of urls) {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
}

export async function createListing(listingData) {
  const docRef = await addDoc(collection(db, LISTINGS_COLLECTION), {
    ...listingData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateListing(listingId, listingData) {
  const docRef = doc(db, LISTINGS_COLLECTION, listingId);
  await updateDoc(docRef, {
    ...listingData,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteListing(listingId) {
  const docRef = doc(db, LISTINGS_COLLECTION, listingId);
  await deleteDoc(docRef);
}

export async function getListing(listingId) {
  const docRef = doc(db, LISTINGS_COLLECTION, listingId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getListings(filters = {}, lastDoc = null, pageSize = 12) {
  let q = collection(db, LISTINGS_COLLECTION);
  const constraints = [];

  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }

  if (filters.minPrice) {
    constraints.push(where('price', '>=', filters.minPrice));
  }

  if (filters.maxPrice) {
    constraints.push(where('price', '<=', filters.maxPrice));
  }

  if (filters.ownerId) {
    constraints.push(where('ownerId', '==', filters.ownerId));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(pageSize));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  q = query(q, ...constraints);
  const snapshot = await getDocs(q);
  
  const listings = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return {
    listings,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
  };
}

export async function getUserListings(userId) {
  const q = query(
    collection(db, LISTINGS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
