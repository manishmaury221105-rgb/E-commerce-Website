import { uploadToFirebaseStorage } from "./firebase-storage";

/**
 * Compresses an image file using HTML5 Canvas to keep its size well under Firestore's 1MB limit.
 * @param file File from file input
 * @param maxWidth Max width in pixels (default: 800)
 * @param maxHeight Max height in pixels (default: 800)
 * @param quality JPEG compression quality from 0.1 to 1.0 (default: 0.8)
 * @returns Promise<string> Base64 data URL (typically 20KB - 60KB)
 */
export function compressImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Fill white background in case of transparent PNG converted to JPEG
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } catch {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Process an image file:
 * 1. Attempts Firebase Storage upload for a clean CDN URL
 * 2. If storage fails or is unconfigured, falls back to compressed Base64 under 80KB (safe for Firestore)
 */
export async function processAndUploadImage(
  file: File,
  folder: string = "uploads",
  maxWidth = 800,
  maxHeight = 800
): Promise<string> {
  try {
    const storageUrl = await uploadToFirebaseStorage(file, folder);
    if (storageUrl) return storageUrl;
  } catch (err) {
    console.warn("Firebase Storage upload failed, falling back to compressed image:", err);
  }

  // Fallback to high quality compressed Canvas Data URL
  return await compressImageFile(file, maxWidth, maxHeight, 0.8);
}
