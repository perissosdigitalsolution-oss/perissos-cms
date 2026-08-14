const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000';
const R2_URL = process.env.NEXT_PUBLIC_R2_URL || 'https://media.perissos.dev';

interface FetchOptions {
  tags?: string[];
  revalidate?: number;
}

export async function fetchPayload<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${CMS_URL}/api${endpoint}`;

  const res = await fetch(url, {
    next: {
      tags: options.tags,
      revalidate: options.revalidate,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`CMS API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

async function safeFetchDocs<T>(endpoint: string): Promise<{ docs: T[] }> {
  try {
    return await fetchPayload<{ docs: T[] }>(endpoint);
  } catch {
    return { docs: [] };
  }
}

export async function getPages() {
  return safeFetchDocs<Page>('/pages?limit=100');
}

export async function getPageBySlug(slug: string) {
  return safeFetchDocs<Page>(`/pages?where[slug][equals]=${slug}`);
}

export async function getBlogArticles() {
  return safeFetchDocs<BlogArticle>('/blog-articles?limit=50&sort=-publishedAt');
}

export async function getBlogArticleBySlug(slug: string) {
  return safeFetchDocs<BlogArticle>(
    `/blog-articles?where[slug][equals]=${slug}`
  );
}

export async function getActivities() {
  return safeFetchDocs<Activity>('/activities?limit=50&sort=-date');
}

export async function getActivityBySlug(slug: string) {
  return safeFetchDocs<Activity>(`/activities?where[slug][equals]=${slug}`);
}

export async function getClientSettings(): Promise<ClientSettings> {
  try {
    return await fetchPayload<ClientSettings>('/globals/client-settings');
  } catch {
    return {
      clientName: 'Perissos',
      domain: 'localhost',
      primaryColor: '#2A367A',
      secondaryColor: '#6D28D9',
    };
  }
}

export function getMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${R2_URL}${path}`;
}

// Types
export interface PayloadDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
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
  author: { id: string; name?: string };
  publishedAt: string;
}

export type Article = BlogArticle;

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
