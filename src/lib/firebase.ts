import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  Auth 
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC1v97NtQc6c9WS8q7mps4YxEO-TeE-tMc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "my-ecommerce-e8ba0.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-ecommerce-e8ba0",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "my-ecommerce-e8ba0.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "128152536069",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:128152536069:web:686faa168ea5930bb0886c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-6FTBRQT49T",
};

// Initialize Firebase safely for SSR/Client
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider custom parameters
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Sign in using Google OAuth Popup
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Firebase Google Auth Error:", error);
    let errorMsg = error.message || "Failed to sign in with Google";
    
    if (error.code === "auth/unauthorized-domain") {
      errorMsg = "Domain 'localhost' is not authorized in Firebase. Please add 'localhost' to Firebase Console -> Authentication -> Settings -> Authorized domains.";
    } else if (error.code === "auth/popup-closed-by-user") {
      errorMsg = "Google sign-in popup was closed before completing.";
    } else if (error.code === "auth/operation-not-allowed") {
      errorMsg = "Google Sign-in provider is disabled in Firebase Console. Please enable it in Authentication -> Sign-in method.";
    } else if (error.code === "auth/popup-blocked") {
      errorMsg = "Popup was blocked by browser. Please allow popups for this site.";
    }
    
    return { 
      success: false, 
      error: errorMsg,
      code: error.code 
    };
  }
}

/**
 * Sign up with Email & Password
 */
export async function signUpWithEmail(email: string, pass: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to sign up" };
  }
}

/**
 * Sign in with Email & Password
 */
export async function signInWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to sign in" };
  }
}

/**
 * Log out from Firebase Auth
 */
export async function logoutFirebase() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
