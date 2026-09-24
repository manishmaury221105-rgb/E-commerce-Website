import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Fetch all documents from a Firestore collection
 */
export async function getCollectionData<T = any>(collectionName: string): Promise<T[]> {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

/**
 * Fetch a single document by ID from Firestore
 */
export async function getDocumentData<T = any>(collectionName: string, docId: string): Promise<T | null> {
  const docRef = doc(db, collectionName, docId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as T;
  }
  return null;
}

/**
 * Add a new document to Firestore collection
 */
export async function addDocument<T = any>(collectionName: string, data: any): Promise<{ id: string } & T> {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...data };
}

/**
 * Set document with specific ID (create or replace)
 */
export async function setDocument(collectionName: string, docId: string, data: any) {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Update document fields in Firestore
 */
export async function updateDocument(collectionName: string, docId: string, data: any) {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a document from Firestore
 */
export async function deleteDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

/**
 * Listen to real-time updates for a collection
 */
export function subscribeToCollection<T = any>(
  collectionName: string, 
  callback: (data: T[]) => void
) {
  const colRef = collection(db, collectionName);
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
    callback(items);
  });
}
