import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Add listing to user's saved listings
export async function addFavorite(userId, listingId) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      savedListings: arrayUnion(listingId)
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding favorite:', error);
    return { success: false, error: error.message };
  }
}

// Remove listing from user's saved listings
export async function removeFavorite(userId, listingId) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      savedListings: arrayRemove(listingId)
    });
    return { success: true };
  } catch (error) {
    console.error('Error removing favorite:', error);
    return { success: false, error: error.message };
  }
}

// Get user's saved listings IDs
export async function getUserFavorites(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().savedListings || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}

// Check if a listing is in user's favorites
export async function isFavorite(userId, listingId) {
  try {
    const favorites = await getUserFavorites(userId);
    return favorites.includes(listingId);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
}
