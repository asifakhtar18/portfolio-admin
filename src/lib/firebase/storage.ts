import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";
import { v4 as uuidv4 } from "uuid"; // You'll need to install uuid

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

export async function uploadMultipleImages(files: File[], basePath: string) {
  try {
    const uploadPromises = files.map(async (file) => {
      const id = uuidv4();
      const fileExtension = file.name.split(".").pop();
      const path = `${basePath}/${id}.${fileExtension}`;
      const url = await uploadImage(file, path);
      return { id, url };
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
}

export async function deleteImage(imageUrl: string) {
  try {
    const urlObj = new URL(imageUrl);
    const pathWithToken = urlObj.pathname;

    const path = decodeURIComponent(pathWithToken.replace(/^\/o\//, ""));

    const imageRef = ref(storage, path);

    await deleteObject(imageRef);

    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}
