import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";

export async function uploadImage(file: File, path: string) {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function deleteImage(imageUrl: string) {
  try {
    // Extract the path from the URL
    const urlObj = new URL(imageUrl);
    const pathWithToken = urlObj.pathname;

    // Remove the /o/ prefix and decode the path
    const path = decodeURIComponent(pathWithToken.replace(/^\/o\//, ""));

    // Create a reference to the file
    const imageRef = ref(storage, path);

    // Delete the file
    await deleteObject(imageRef);

    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}
