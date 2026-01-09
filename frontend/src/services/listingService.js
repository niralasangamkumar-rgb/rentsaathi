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
    featured: false, // Default to non-featured
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

// Get featured listings
export async function getFeaturedListings(cityId = null, pageSize = 8) {
  let q;
  const constraints = [
    where('featured', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  ];
  
  if (cityId) {
    constraints.unshift(where('cityId', '==', cityId));
  }
  
  q = query(collection(db, LISTINGS_COLLECTION), ...constraints);
  
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching featured listings:', error);
    return [];
  }
}

// Get regular (non-featured) listings
export async function getRegularListings(filters = {}, lastDoc = null, pageSize = 12) {
  const constraints = [];

  if (filters.cityId) {
    constraints.push(where('cityId', '==', filters.cityId));
  }

  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }

  // Note: Firestore requires composite indexes for multiple range queries
  // For simplicity, we'll filter price client-side if needed
  
  if (filters.area) {
    constraints.push(where('area', '==', filters.area));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(pageSize));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(collection(db, LISTINGS_COLLECTION), ...constraints);
  
  try {
    const snapshot = await getDocs(q);
    
    let listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side price filtering (to avoid complex composite indexes)
    if (filters.minPrice) {
      listings = listings.filter(l => l.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      listings = listings.filter(l => l.price <= filters.maxPrice);
    }

    return {
      listings,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
    };
  } catch (error) {
    console.error('Error fetching listings:', error);
    return { listings: [], lastDoc: null };
  }
}

// Legacy function for compatibility
export async function getListings(filters = {}, lastDoc = null, pageSize = 12) {
  return getRegularListings(filters, lastDoc, pageSize);
}

export async function getUserListings(userId) {
  const q = query(
    collection(db, LISTINGS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user listings:', error);
    return [];
  }
}

// Get unique areas/localities from listings
export async function getAreas(cityId = null) {
  try {
    let q = collection(db, LISTINGS_COLLECTION);
    if (cityId) {
      q = query(q, where('cityId', '==', cityId));
    }
    const snapshot = await getDocs(q);
    const areas = new Set();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.area) {
        areas.add(data.area);
      }
    });
    return Array.from(areas).sort();
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
}
