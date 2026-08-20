export type Plan = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  maxPages: number;
  maxBlogArticles: number;
  maxActivities: number;
  maxMediaSize: number;
  maxUsers: number;
  customDomain: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxPages: 5,
    maxBlogArticles: 10,
    maxActivities: 5,
    maxMediaSize: 100 * 1024 * 1024,
    maxUsers: 2,
    customDomain: false,
    prioritySupport: false,
  },
  pro: {
    maxPages: 50,
    maxBlogArticles: 100,
    maxActivities: 50,
    maxMediaSize: 5 * 1024 * 1024 * 1024,
    maxUsers: 10,
    customDomain: true,
    prioritySupport: true,
  },
  enterprise: {
    maxPages: Infinity,
    maxBlogArticles: Infinity,
    maxActivities: Infinity,
    maxMediaSize: 50 * 1024 * 1024 * 1024,
    maxUsers: Infinity,
    customDomain: true,
    prioritySupport: true,
  },
};

export interface PayloadDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends PayloadDocument {
  email: string;
  name?: string;
  role: 'admin' | 'editor';
}

export interface Page extends PayloadDocument {
  title: string;
  slug: string;
  content: unknown;
  publishedAt: string;
}

export interface BlogArticle extends PayloadDocument {
  title: string;
  slug: string;
  excerpt: string;
  content: unknown;
  featuredImage?: { url: string; alt?: string };
  author: User | string;
  publishedAt: string;
}

export interface Activity extends PayloadDocument {
  title: string;
  slug: string;
  description?: string;
  content?: unknown;
  image?: { url: string; alt?: string };
  date: string;
  category: 'workshop' | 'seminar' | 'conference' | 'retreat' | 'other';
}

export interface ClientSettings {
  clientName: string;
  domain: string;
  logo?: { url: string; alt?: string };
  primaryColor: string;
  secondaryColor: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export interface Media extends PayloadDocument {
  filename: string;
  mimeType: string;
  filesize: number;
  url: string;
  alt?: string;
  caption?: string;
  prefix?: string;
}

export interface APIResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface PayloadError {
  message: string;
  code?: string;
  data?: unknown;
}

// Restaurant-specific types
export interface MenuItem {
  name: string;
  description?: string;
  price: string;
  image?: string;
  dietaryTags?: string[];
  isRecommended?: boolean;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface Testimonial {
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  text: string;
}

export interface Special {
  title: string;
  description: string;
  discountPercent: number;
  counterTarget: number;
  label?: string;
}

export interface GalleryImage {
  url: string;
  caption?: string;
  alt?: string;
}
