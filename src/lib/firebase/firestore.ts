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
  where,
} from "firebase/firestore";
import { db } from "./config";
import { deleteImage } from "./storage";
import type { Skill, Testimonial, Project, Message } from "../types";
import { get } from "http";

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

export async function deleteSkill(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "skills", id));
  } catch (error) {
    console.error("Error deleting skill:", error);
    throw error;
  }
}

// Projects Section
export async function getProjects(): Promise<Project[]> {
  try {
    const projectsRef = collection(db, "projects");
    const querySnapshot = await getDocs(
      query(projectsRef, orderBy("createdAt", "desc"))
    );

    const projects = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });

    return projects as Project[];
  } catch (error) {
    console.error("Error getting projects:", error);
    throw error;
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Project;
    }

    return null;
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
}

export async function createProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<string> {
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

export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<void> {
  try {
    const docRef = doc(db, "projects", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    // Add to updates collection
    await addDoc(collection(db, "updates"), {
      section: "Projects",
      title: `Project "${data.name || "Unknown"}" updated`,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    // Get project data to delete images
    const projectRef = doc(db, "projects", id);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
      const projectData = projectSnap.data() as Project;

      // Delete the project document
      await deleteDoc(projectRef);

      // Delete all project images
      if (projectData.images && projectData.images.length > 0) {
        for (const image of projectData.images) {
          if (image.url) {
            await deleteImage(image.url);
          }
        }
      }

      // Add to updates collection
      await addDoc(collection(db, "updates"), {
        section: "Projects",
        title: `Project "${projectData.name}" deleted`,
        updatedAt: serverTimestamp(),
      });
    }
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

// Testimonials functions
export async function getTestimonials(
  approvedOnly = false
): Promise<Testimonial[]> {
  try {
    const testimonialsRef = collection(db, "testimonials");
    let queryRef = query(testimonialsRef);

    const querySnapshot = await getDocs(queryRef);

    const testimonials = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Testimonial;
    });

    console.log(testimonials);
    return testimonials;
  } catch (error) {
    console.error("Error getting testimonials:", error);
    throw error;
  }
}

export async function getTestimonial(id: string): Promise<Testimonial | null> {
  try {
    const docRef = doc(db, "testimonials", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Testimonial;
    }

    return null;
  } catch (error) {
    console.error("Error getting testimonial:", error);
    throw error;
  }
}

export async function createTestimonial(
  data: Omit<Testimonial, "id" | "createdAt" | "approved">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "testimonials"), {
      ...data,
      approved: false, // New testimonials are not approved by default
      createdAt: serverTimestamp(),
    });

    // Add to updates collection
    await addDoc(collection(db, "updates"), {
      section: "Testimonials",
      title: `New testimonial from "${data.name}" received`,
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating testimonial:", error);
    throw error;
  }
}

export async function updateTestimonial(
  id: string,
  data: Partial<Testimonial>
): Promise<void> {
  try {
    const docRef = doc(db, "testimonials", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    if (data.isApproved !== undefined) {
      await addDoc(collection(db, "updates"), {
        section: "Testimonials",
        title: `Testimonial ${data.isApproved ? "approved" : "disapproved"}`,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating testimonial:", error);
    throw error;
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  try {
    // Get testimonial data for update log
    const testimonialRef = doc(db, "testimonials", id);
    const testimonialSnap = await getDoc(testimonialRef);

    if (testimonialSnap.exists()) {
      const testimonialData = testimonialSnap.data();

      // Delete the testimonial document
      await deleteDoc(testimonialRef);

      // Delete avatar image if it exists
      if (testimonialData.avatar) {
        await deleteImage(testimonialData.avatar);
      }

      // Add to updates collection
      await addDoc(collection(db, "updates"), {
        section: "Testimonials",
        title: `Testimonial from "${testimonialData.name}" deleted`,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    throw error;
  }
}

export async function getMessages(): Promise<Message[]> {
  try {
    const messagesRef = collection(db, "contacts");
    const querySnapshot = await getDocs(messagesRef);
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Message[];
    return messages;
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
}
