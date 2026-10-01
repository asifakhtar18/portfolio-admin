// Canonical API response types for the portfolio-admin CMS.
//
// These mirror the API's canonical models (portfolio-api/src/models/canonical.ts):
// the MongoDB `_id` is serialized as a string `id`, all dates are ISO-8601
// strings, and field names are canonical (`isApproved`, `createdAt`, `images`).
// Task 28 will finalize/consolidate the shared types across projects; for now
// these live under `src/lib/api` so the API modules are strongly typed and the
// existing `src/lib/types.ts` (used by current components) is left untouched.

/** A single social-media link on a contact record. */
export interface SocialMediaLink {
  platform: string;
  url: string;
}

/** Canonical About singleton. */
export interface AboutResponse {
  id: string;
  bio: string;
  designation: string;
  profileImage?: string;
  updatedAt: string;
}

/** Canonical Skills singleton. */
export interface SkillsResponse {
  id?: string;
  items: string[];
  updatedAt?: string;
}

/** A single project image (canonical `images` item shape). */
export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
}

/** Canonical Project. */
export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  images: ProjectImage[];
  link?: string;
  sourceCode?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Fields accepted when creating or updating a project (excludes server-managed fields). */
export interface ProjectInput {
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
  sourceCode?: string;
  featured?: boolean;
}

/** Canonical Experience. */
export interface ExperienceResponse {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies?: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** Fields accepted when creating or updating an experience. */
export interface ExperienceInput {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies?: string[];
  imageUrl?: string;
}

/** Canonical ContactInfo singleton. */
export interface ContactInfoResponse {
  id: string;
  email: string;
  phone: string;
  socialMedia: SocialMediaLink[];
  updatedAt: string;
}

/** Fields accepted when creating or updating contact info. */
export interface ContactInfoInput {
  email: string;
  phone: string;
  socialMedia?: SocialMediaLink[];
}

/** Canonical Testimonial (canonical approval field `isApproved`). */
export interface TestimonialResponse {
  id: string;
  name: string;
  role: string;
  company: string;
  message: string;
  avatar?: string;
  rating?: number;
  linkedin?: string;
  twitter?: string;
  isApproved: boolean;
  createdAt: string;
}

/** Canonical Message (canonical timestamp field `createdAt`). */
export interface MessageResponse {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

/** Canonical Update_Log entry. */
export interface UpdateLogResponse {
  id: string;
  section: string;
  title: string;
  updatedAt: string;
}

/** Dashboard stats counts. */
export interface StatsResponse {
  projects: number;
  skills: number;
  experiences: number;
}

/** Authenticated tenant profile from `/auth/me` (no secrets). */
export interface TenantProfile {
  id: string;
  email: string;
  username: string;
  storageConfigured: boolean;
}

/** Response of `/auth/register` and `/auth/login`. */
export interface AuthTokenResponse {
  token: string;
}
