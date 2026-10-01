// Core data types for the portfolio application

export type AboutData = {
  bio: string;
  designation: string;
  profileImage?: string;
};

export type Skill = {
  id: string;
  name: string;
};

export type ProjectImage = {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  images: ProjectImage[];
  link?: string;
  sourceCode?: string;
  featured: boolean;
  // Canonical dates are ISO-8601 strings from the API (R16.5).
  createdAt: string;
  updatedAt: string;
};

export type Experience = {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies?: string[];
  imageUrl?: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  message: string;
  avatar?: string;
  rating?: number; // 1-5 stars (optional in canonical model)
  linkedin?: string;
  twitter?: string;
  // Canonical approval field (R16.1) and ISO-8601 date string (R16.5).
  isApproved: boolean;
  createdAt: string;
};

export type ContactData = {
  email: string;
  phone: string;
  socialMedia: {
    platform: string;
    url: string;
  }[];
};

export type UpdateLog = {
  id: string;
  section: string;
  title: string;
  // Canonical date is an ISO-8601 string from the API (R16.5).
  updatedAt: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  // Canonical timestamp field (R16.2), ISO-8601 string (R16.5).
  createdAt: string;
};
