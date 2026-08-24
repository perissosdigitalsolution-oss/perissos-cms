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

// Accounting types (Sprint 19)
export interface AccountingInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  currencyCode: string;
  exchangeRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  balance: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void' | 'partially_paid';
  entries: AccountingInvoiceEntry[];
  createdAt: string;
  updatedAt?: string;
}

export interface AccountingInvoiceEntry {
  id: string;
  index: number;
  itemId?: string;
  itemName?: string;
  quantity: number;
  rate: number;
  description?: string;
  debit?: number;
  credit?: number;
  amount: number;
  subtotalExcludingTax: number;
  taxAmount?: number;
  discountAmount?: number;
  discountPercentage?: number;
  sellAccountId?: number;
}

export interface AccountingAccount {
  id: number;
  name: string;
  slug: string;
  code: string;
  description?: string;
  active: number;
  index: number;
  predefined: number;
  accountType: string;
  parentAccountId?: number;
  currencyCode: string;
  accountTypeLabel?: string;
  accountParentType?: string;
  accountRootType?: string;
  accountNormal?: 'debit' | 'credit';
  isBalanceSheetAccount: boolean;
  isPLSheet: boolean;
  formattedAmount?: string;
  flattenName?: string;
}

export interface AccountingJournalEntry {
  id: string;
  journalNumber: string;
  date: string;
  reference?: string;
  description?: string;
  amount: number;
  currencyCode: string;
  exchangeRate: number;
  userId: number;
  isPublished: boolean;
  entries: AccountingJournalEntryLine[];
  createdAt: string;
}

export interface AccountingJournalEntryLine {
  id: string;
  index: number;
  accountId: number;
  accountName?: string;
  debit: number;
  credit: number;
  description?: string;
  contactId?: number;
}

export interface AccountingBalance {
  accountId: number;
  accountName: string;
  accountCode: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
  formattedDebit?: string;
  formattedCredit?: string;
  formattedBalance?: string;
}

export interface FinancialReport {
  type: 'profit-loss' | 'balance-sheet' | 'trial-balance' | 'cashflow';
  fromDate: string;
  toDate: string;
  currencyCode: string;
  data: unknown[];
  meta: {
    organizationName: string;
    baseCurrency: string;
    formattedFromDate: string;
    formattedToDate: string;
    formattedDateRange: string;
  };
}

export interface AccountingActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  source: string;
}

export interface AccountingMutation {
  action: string;
  params: Record<string, unknown>;
}
