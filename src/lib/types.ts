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
  createdAt: Date;
  updatedAt: Date;
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
  position: string;
  company: string;
  message: string;
  avatar?: string;
  rating: number; // 1-5 stars
  approved: boolean;
  createdAt: Date;
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
  updatedAt: Date;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
};
