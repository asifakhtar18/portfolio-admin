import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./config";
import { deleteImage } from "./storage";

// About Section
export async function getAboutData() {
  try {
    const docRef = doc(db, "portfolio", "about");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    return null;
  } catch (error) {
    console.error("Error getting about data:", error);
    throw error;
  }
}

export async function updateAboutData(data: any) {
  try {
    const docRef = doc(db, "portfolio", "about");
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Add to updates collection
    await addDoc(collection(db, "updates"), {
      section: "About",
      title: "About information updated",
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error updating about data:", error);
    throw error;
  }
}

// Skills Section
export async function getSkills() {
  try {
    const docRef = doc(db, "portfolio", "skills");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().items;
    }

    return [];
  } catch (error) {
    console.error("Error getting skills:", error);
    throw error;
  }
}

export async function updateSkills(skills: string[]) {
  try {
    const docRef = doc(db, "portfolio", "skills");
    await setDoc(docRef, {
      items: skills,
      updatedAt: serverTimestamp(),
    });

    // Add to updates collection
    await addDoc(collection(db, "updates"), {
      section: "Skills",
      title: "Skills updated",
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error updating skills:", error);
    throw error;
  }
}

// Projects Section
export async function getProjects() {
  try {
    const projectsRef = collection(db, "projects");
    const querySnapshot = await getDocs(
      query(projectsRef, orderBy("createdAt", "desc"))
    );

    const projects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(projects);

    return projects;
  } catch (error) {
    console.error("Error getting projects:", error);
    throw error;
  }
}

export async function getProject(id: string) {
  try {
    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
}

export async function createProject(data: any) {
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Add to updates collection
    await addDoc(collection(db, "updates"), {
      section: "Projects",
      title: `Project "${data.name}" created`,
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function updateProject(id: string, data: any) {
  try {
    const docRef = doc(db, "projects", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    // Add to updates collection
    await addDoc(collection(db, "updates"), {
      section: "Projects",
      title: `Project "${data.name}" updated`,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

export async function deleteProject(id: string) {
  try {
    // Get project data to delete image
    const projectRef = doc(db, "projects", id);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
      const projectData = projectSnap.data();

      // Delete the project document
      await deleteDoc(projectRef);

      // Delete project image if it exists
      if (projectData.imageUrl) {
        await deleteImage(projectData.imageUrl);
      }

      // Add to updates collection
      await addDoc(collection(db, "updates"), {
        section: "Projects",
        title: `Project "${projectData.name}" deleted`,
        updatedAt: serverTimestamp(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}

// Experience Section
export async function getExperiences() {
  try {
    const experiencesRef = collection(db, "experiences");
    const querySnapshot = await getDocs(
      query(experiencesRef, orderBy("createdAt", "desc"))
    );

    const experiences = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return experiences;
  } catch (error) {
    console.error("Error getting experiences:", error);
    throw error;
  }
}

export async function getExperience(id: string) {
  try {
    const docRef = doc(db, "experiences", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting experience:", error);
    throw error;
  }
}

export async function createExperience(data: any) {
  try {
    const docRef = await addDoc(collection(db, "experiences"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Add to updates collection
    await addDoc(collection(db, "updates"), {
      section: "Experience",
      title: `Experience at "${data.company}" added`,
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating experience:", error);
    throw error;
  }
}

export async function updateExperience(id: string, data: any) {
  try {
    const docRef = doc(db, "experiences", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    // Add to updates collection
    await addDoc(collection(db, "updates"), {
      section: "Experience",
      title: `Experience at "${data.company}" updated`,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error updating experience:", error);
    throw error;
  }
}

export async function deleteExperience(id: string) {
  try {
    // Get experience data for update log
    const expRef = doc(db, "experiences", id);
    const expSnap = await getDoc(expRef);

    if (expSnap.exists()) {
      const expData = expSnap.data();

      // Delete the experience document
      await deleteDoc(expRef);

      // Add to updates collection
      await addDoc(collection(db, "updates"), {
        section: "Experience",
        title: `Experience at "${expData.company}" deleted`,
        updatedAt: serverTimestamp(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error deleting experience:", error);
    throw error;
  }
}

// Contact Section
export async function getContactData() {
  try {
    const docRef = doc(db, "portfolio", "contact");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    return null;
  } catch (error) {
    console.error("Error getting contact data:", error);
    throw error;
  }
}

export async function updateContactData(data: any) {
  try {
    const docRef = doc(db, "portfolio", "contact");
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Add to updates collection
    await addDoc(collection(db, "updates"), {
      section: "Contact",
      title: "Contact information updated",
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error updating contact data:", error);
    throw error;
  }
}

// Dashboard Stats
export async function getStats() {
  try {
    // Get projects count
    const projectsRef = collection(db, "projects");
    const projectsSnapshot = await getDocs(projectsRef);
    const projectsCount = projectsSnapshot.size;

    // Get skills count
    const skillsDoc = await getDoc(doc(db, "portfolio", "skills"));
    const skillsCount = skillsDoc.exists() ? skillsDoc.data().items.length : 0;

    // Get experiences count
    const experiencesRef = collection(db, "experiences");
    const experiencesSnapshot = await getDocs(experiencesRef);
    const experiencesCount = experiencesSnapshot.size;

    return {
      projects: projectsCount,
      skills: skillsCount,
      experience: experiencesCount,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    throw error;
  }
}

// Recent Updates
export async function getRecentUpdates() {
  try {
    const updatesRef = collection(db, "updates");
    const querySnapshot = await getDocs(
      query(updatesRef, orderBy("updatedAt", "desc"), limit(5))
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error("Error getting recent updates:", error);
    throw error;
  }
}
