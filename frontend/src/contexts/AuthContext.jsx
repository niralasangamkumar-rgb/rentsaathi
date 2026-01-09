import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Setup reCAPTCHA verifier
  function setupRecaptcha(elementId) {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          window.recaptchaVerifier = null;
        }
      });
    }
    return window.recaptchaVerifier;
  }

  // Send OTP to phone number
  async function sendOTP(phoneNumber, elementId) {
    try {
      const appVerifier = setupRecaptcha(elementId);
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      return { success: true };
    } catch (error) {
      console.error('Error sending OTP:', error);
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      return { success: false, error: error.message };
    }
  }

  // Verify OTP
  async function verifyOTP(otp) {
    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result found. Please request OTP again.');
      }
      const result = await confirmationResult.confirm(otp);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error: error.message };
    }
  }

  // Create or update user profile after phone auth
  async function createUserProfile(userId, phoneNumber, role, name = '') {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user profile
        await setDoc(userRef, {
          phone: phoneNumber,
          role: role, // 'owner' or 'renter'
          name: name,
          email: '',
          savedListings: [],
          createdAt: new Date().toISOString()
        });
      }
      
      await fetchUserProfile(userId);
      return { success: true };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Email/Password signup
  async function signup(email, password, name, phone, role) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name,
      email,
      phone,
      role: role || 'renter',
      savedListings: [],
      createdAt: new Date().toISOString()
    });
    
    return userCredential;
  }

  // Email/Password login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Logout
  function logout() {
    setConfirmationResult(null);
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    return signOut(auth);
  }

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile({ id: docSnap.id, ...docSnap.data() });
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Update user profile
  async function updateUserProfile(data) {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, data, { merge: true });
      await fetchUserProfile(currentUser.uid);
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user is owner
  function isOwner() {
    return userProfile?.role === 'owner';
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    sendOTP,
    verifyOTP,
    createUserProfile,
    fetchUserProfile,
    updateUserProfile,
    isOwner
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
