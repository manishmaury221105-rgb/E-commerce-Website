import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload a file to Firebase Storage
 * @param file File to upload
 * @param folder Destination folder (e.g. 'products', 'banners', 'users')
 * @param onProgress Optional progress callback (0-100)
 * @returns Promise<string> Download URL of uploaded file
 */
export async function uploadToFirebaseStorage(
  file: File | Blob,
  folder: string = "uploads",
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `${folder}/${timestamp}-${randomSuffix}`;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.error("Firebase Storage Upload Error:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Delete a file from Firebase Storage by its storage path or full URL
 */
export async function deleteFromFirebaseStorage(urlOrPath: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, urlOrPath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error("Firebase Storage Delete Error:", error);
    return false;
  }
}
