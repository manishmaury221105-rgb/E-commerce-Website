import { getApps, initializeApp, cert, getApp, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

let adminApp: App | null = null;

if (getApps().length === 0) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined;

    if (projectId && clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else if (projectId) {
      adminApp = initializeApp({
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      adminApp = initializeApp({
        projectId: "ecommerce-demo",
      });
    }
  } catch (error) {
    console.warn("Firebase admin initialization warning:", error);
  }
} else {
  adminApp = getApp();
}

export const adminAuth: Auth | null = adminApp ? getAuth(adminApp) : null;
export const adminFirestore: Firestore | null = adminApp ? getFirestore(adminApp) : null;
export const adminStorage: Storage | null = adminApp ? getStorage(adminApp) : null;
export { adminApp };
