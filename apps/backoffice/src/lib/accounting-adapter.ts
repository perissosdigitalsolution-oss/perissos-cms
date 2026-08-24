// Accounting Adapter for Perissos CMS (Sprint 19)
// Supports Bigcapital and Mock implementations

import type { AccountingInvoice, AccountingAccount, AccountingJournalEntry, FinancialReport, AccountingActionResult } from '@perissos/shared/types';

// ============================================================================
// Type Definitions
// ============================================================================

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

export interface AccountingQueryResult<T> {
  items: T[];
  count: number;
  source: string;
  query?: string | null;
}

export interface AccountingInvoiceMutation {
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: Array<{
    itemId: string;
    quantity: number;
    rate: number;
    description?: string;
  }>;
}

export interface AccountingJournalEntryMutation {
  date: string;
  reference: string;
  entries: Array<{
    index: number;
    accountId: number;
    debit: number;
    credit: number;
    description?: string;
    contactId?: number;
  }>;
}

// ============================================================================
// Adapter Interface
// ============================================================================

export interface AccountingAdapter {
  // Invoices
  queryInvoices(filter?: string, limit?: number): Promise<AccountingInvoice[]>;
  getInvoice(id: string): Promise<AccountingInvoice | null>;
  createInvoice(data: AccountingInvoiceMutation): Promise<AccountingInvoice>;
  updateInvoiceStatus(id: string, status: string): Promise<AccountingInvoice>;

  // Journal Entries
  queryJournalEntries(filter?: string, limit?: number): Promise<AccountingJournalEntry[]>;
  createJournalEntry(data: AccountingJournalEntryMutation): Promise<AccountingJournalEntry>;

  // Accounts
  getAccount(id: string): Promise<AccountingAccount | null>;
  queryAccounts(filter?: string, limit?: number): Promise<AccountingAccount[]>;

  // Reports
  getFinancialSummary(): Promise<{
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  }>;
  generateReport(type: 'profit-loss' | 'balance-sheet' | 'trial-balance' | 'cashflow', startDate: string, endDate: string): Promise<FinancialReport>;
}

// ============================================================================
// Mock Adapter (Development)
// ============================================================================

class MockAccountingAdapter implements AccountingAdapter {
  private invoices: AccountingInvoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-00001',
      invoiceDate: '2026-08-24',
      dueDate: '2026-09-24',
      customerId: '1',
      customerName: 'Test Customer',
      customerEmail: 'customer@test.com',
      currencyCode: 'USD',
      exchangeRate: 1,
      subtotal: 100,
      taxAmount: 0,
      total: 100,
      balance: 100,
      status: 'sent',
      entries: [],
      createdAt: '2026-08-24T11:14:42.000Z',
    },
    {
      id: '2',
      invoiceNumber: 'INV-00002',
      invoiceDate: '2026-08-20',
      dueDate: '2026-09-20',
      customerId: '1',
      customerName: 'Test Customer',
      customerEmail: 'customer@test.com',
      currencyCode: 'USD',
      exchangeRate: 1,
      subtotal: 250,
      taxAmount: 25,
      total: 275,
      balance: 0,
      status: 'paid',
      entries: [],
      createdAt: '2026-08-20T10:00:00.000Z',
    },
    {
      id: '3',
      invoiceNumber: 'INV-00003',
      invoiceDate: '2026-08-15',
      dueDate: '2026-09-15',
      customerId: '2',
      customerName: 'Another Client',
      customerEmail: 'client@test.com',
      currencyCode: 'USD',
      exchangeRate: 1,
      subtotal: 500,
      taxAmount: 0,
      total: 500,
      balance: 500,
      status: 'overdue',
      entries: [],
      createdAt: '2026-08-15T09:00:00.000Z',
    },
  ];

  private journalEntries: AccountingJournalEntry[] = [
    {
      id: '1',
      journalNumber: 'TEST-001',
      date: '2026-08-24',
      reference: 'Test Journal',
      description: '',
      amount: 100,
      currencyCode: 'USD',
      exchangeRate: 1,
      userId: 1,
      isPublished: false,
      entries: [
        { id: '1', index: 1, accountId: 1000, accountName: 'Bank Account', debit: 100, credit: 0, description: 'Test debit' },
        { id: '2', index: 2, accountId: 1008, accountName: 'Accounts Payable (A/P)', debit: 0, credit: 100, description: 'Test credit', contactId: 2 },
      ],
      createdAt: '2026-08-24T14:02:20.000Z',
    },
  ];

  private accounts: AccountingAccount[] = [
    { id: 1000, name: 'Bank Account', slug: 'bank-account', code: '10001', description: '', active: 1, index: 1, predefined: 1, accountType: 'bank', parentAccountId: undefined, currencyCode: 'USD', accountTypeLabel: 'Bank', accountParentType: 'current-asset', accountRootType: 'asset', accountNormal: 'debit', isBalanceSheetAccount: true, isPLSheet: false, formattedAmount: '0.00', flattenName: 'Bank Account' },
    { id: 1006, name: 'Accounts Receivable (A/R)', slug: 'accounts-receivable', code: '10007', description: '', active: 1, index: 1, predefined: 1, accountType: 'accounts-receivable', parentAccountId: undefined, currencyCode: 'USD', accountTypeLabel: 'Accounts Receivable', accountParentType: 'current-asset', accountRootType: 'asset', accountNormal: 'debit', isBalanceSheetAccount: true, isPLSheet: false, formattedAmount: '0.00', flattenName: 'Accounts Receivable (A/R)' },
    { id: 1008, name: 'Accounts Payable (A/P)', slug: 'accounts-payable', code: '20001', description: '', active: 1, index: 1, predefined: 1, accountType: 'accounts-payable', parentAccountId: undefined, currencyCode: 'USD', accountTypeLabel: 'Accounts Payable', accountParentType: 'current-liability', accountRootType: 'liability', accountNormal: 'credit', isBalanceSheetAccount: true, isPLSheet: false, formattedAmount: '0.00', flattenName: 'Accounts Payable (A/P)' },
    { id: 1025, name: 'Sales of Product Income', slug: 'sales-of-product-income', code: '50001', description: '', active: 1, index: 1, predefined: 1, accountType: 'income', parentAccountId: undefined, currencyCode: 'USD', accountTypeLabel: 'Income', accountParentType: 'income', accountRootType: 'income', accountNormal: 'credit', isBalanceSheetAccount: false, isPLSheet: true, formattedAmount: '0.00', flattenName: 'Sales of Product Income' },
    { id: 1019, name: 'Cost of Goods Sold', slug: 'cost-of-goods-sold', code: '40002', description: '', active: 1, index: 1, predefined: 1, accountType: 'cost-of-goods-sold', parentAccountId: undefined, currencyCode: 'USD', accountTypeLabel: 'Cost of Goods Sold', accountParentType: 'expense', accountRootType: 'expense', accountNormal: 'debit', isBalanceSheetAccount: false, isPLSheet: true, formattedAmount: '0.00', flattenName: 'Cost of Goods Sold' },
  ];

  async queryInvoices(filter?: string, limit = 10): Promise<AccountingInvoice[]> {
    let result = [...this.invoices];
    if (filter) {
      result = result.filter((inv) =>
        inv.invoiceNumber.toLowerCase().includes(filter.toLowerCase()) ||
        inv.customerName?.toLowerCase().includes(filter.toLowerCase())
      );
    }
    return result.slice(0, limit);
  }

  async getInvoice(id: string): Promise<AccountingInvoice | null> {
    return this.invoices.find((inv) => inv.id === id) || null;
  }

  async createInvoice(data: AccountingInvoiceMutation): Promise<AccountingInvoice> {
    const newInvoice: AccountingInvoice = {
      id: String(this.invoices.length + 1),
      invoiceNumber: `INV-${String(this.invoices.length + 1).padStart(5, '0')}`,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      customerId: data.customerId,
      customerName: 'Test Customer',
      customerEmail: 'customer@test.com',
      currencyCode: 'USD',
      exchangeRate: 1,
      subtotal: data.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0),
      taxAmount: 0,
      total: data.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0),
      balance: data.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0),
      status: 'draft',
      entries: data.lineItems.map((item, idx) => ({
        id: String(idx + 1),
        index: idx + 1,
        itemId: item.itemId,
        itemName: `Item ${item.itemId}`,
        quantity: item.quantity,
        rate: item.rate,
        description: item.description,
        amount: item.quantity * item.rate,
        subtotalExcludingTax: item.quantity * item.rate,
      })),
      createdAt: new Date().toISOString(),
    };
    this.invoices.push(newInvoice);
    return newInvoice;
  }

  async updateInvoiceStatus(id: string, status: string): Promise<AccountingInvoice> {
    const idx = this.invoices.findIndex((inv) => inv.id === id);
    if (idx === -1) throw new Error('Invoice not found');
    this.invoices[idx].status = status as AccountingInvoice['status'];
    return this.invoices[idx];
  }

  async queryJournalEntries(filter?: string, limit = 10): Promise<AccountingJournalEntry[]> {
    let result = [...this.journalEntries];
    if (filter) {
      result = result.filter((je) =>
        je.journalNumber.toLowerCase().includes(filter.toLowerCase()) ||
        je.reference?.toLowerCase().includes(filter.toLowerCase())
      );
    }
    return result.slice(0, limit);
  }

  async createJournalEntry(data: AccountingJournalEntryMutation): Promise<AccountingJournalEntry> {
    const newEntry: AccountingJournalEntry = {
      id: String(this.journalEntries.length + 1),
      journalNumber: `JNL-${String(this.journalEntries.length + 1).padStart(5, '0')}`,
      date: data.date,
      reference: data.reference,
      description: '',
      amount: data.entries.reduce((sum, e) => sum + e.debit, 0),
      currencyCode: 'USD',
      exchangeRate: 1,
      userId: 1,
      isPublished: false,
      entries: data.entries.map((e) => ({
        ...e,
        id: String(Math.random()),
        accountName: this.accounts.find((a) => a.id === e.accountId)?.name,
      })),
      createdAt: new Date().toISOString(),
    };
    this.journalEntries.push(newEntry);
    return newEntry;
  }

  async getAccount(id: string): Promise<AccountingAccount | null> {
    return this.accounts.find((acc) => acc.id === Number(id)) || null;
  }

  async queryAccounts(filter?: string, limit = 50): Promise<AccountingAccount[]> {
    let result = [...this.accounts];
    if (filter) {
      result = result.filter((acc) =>
        acc.name.toLowerCase().includes(filter.toLowerCase()) ||
        acc.code.includes(filter)
      );
    }
    return result.slice(0, limit);
  }

  async getFinancialSummary(): Promise<{
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  }> {
    return {
      totalAssets: 50000,
      totalLiabilities: 20000,
      totalEquity: 30000,
      totalRevenue: 15000,
      totalExpenses: 8000,
      netIncome: 7000,
    };
  }

  async generateReport(
    type: 'profit-loss' | 'balance-sheet' | 'trial-balance' | 'cashflow',
    startDate: string,
    endDate: string
  ): Promise<FinancialReport> {
    return {
      type,
      fromDate: startDate,
      toDate: endDate,
      currencyCode: 'USD',
      data: [],
      meta: {
        organizationName: 'Perissos Demo',
        baseCurrency: 'USD',
        formattedFromDate: startDate,
        formattedToDate: endDate,
        formattedDateRange: `From ${startDate} to ${endDate}`,
      },
    };
  }
}

// ============================================================================
// Bigcapital Adapter (Production)
// ============================================================================

class BigcapitalAccountingAdapter implements AccountingAdapter {
  private baseUrl: string;
  private apiKey: string;
  private organizationId: string;

  constructor() {
    this.baseUrl = process.env.BIGCAPITAL_API_URL || 'http://localhost:3200';
    this.apiKey = process.env.BIGCAPITAL_API_KEY || '';
    this.organizationId = process.env.BIGCAPITAL_ORG_ID || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'organization-id': this.organizationId,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Bigcapital API error: ${response.status} - ${error.message || error}`);
    }

    return response.json();
  }

  async queryInvoices(filter?: string, limit = 10): Promise<AccountingInvoice[]> {
    const params = new URLSearchParams();
    if (filter) params.append('search', filter);
    params.append('limit', String(limit));
    params.append('page', '1');

    const response = await this.request<{ data: AccountingInvoice[] }>(
      `/api/sale-invoices?${params.toString()}`
    );
    return response.data || [];
  }

  async getInvoice(id: string): Promise<AccountingInvoice | null> {
    try {
      const response = await this.request<AccountingInvoice>(`/api/sale-invoices/${id}`);
      return response;
    } catch {
      return null;
    }
  }

  async createInvoice(data: AccountingInvoiceMutation): Promise<AccountingInvoice> {
    const response = await this.request<AccountingInvoice>('/api/sale-invoices', {
      method: 'POST',
      body: JSON.stringify({
        invoice_date: data.invoiceDate,
        due_date: data.dueDate,
        customer_id: data.customerId,
        entries: data.lineItems.map((item) => ({
          item_id: item.itemId,
          quantity: item.quantity,
          rate: item.rate,
          description: item.description,
        })),
      }),
    });
    return response;
  }

  async updateInvoiceStatus(id: string, status: string): Promise<AccountingInvoice> {
    const response = await this.request<AccountingInvoice>(`/api/sale-invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response;
  }

  async queryJournalEntries(filter?: string, limit = 10): Promise<AccountingJournalEntry[]> {
    const params = new URLSearchParams();
    if (filter) params.append('search', filter);
    params.append('limit', String(limit));
    params.append('page', '1');

    const response = await this.request<{ data: AccountingJournalEntry[] }>(
      `/api/manual-journals?${params.toString()}`
    );
    return response.data || [];
  }

  async createJournalEntry(data: AccountingJournalEntryMutation): Promise<AccountingJournalEntry> {
    const response = await this.request<AccountingJournalEntry>('/api/manual-journals', {
      method: 'POST',
      body: JSON.stringify({
        date: data.date,
        reference: data.reference,
        entries: data.entries,
      }),
    });
    return response;
  }

  async getAccount(id: string): Promise<AccountingAccount | null> {
    try {
      const response = await this.request<AccountingAccount>(`/api/accounts/${id}`);
      return response;
    } catch {
      return null;
    }
  }

  async queryAccounts(filter?: string, limit = 50): Promise<AccountingAccount[]> {
    const params = new URLSearchParams();
    if (filter) params.append('search', filter);
    params.append('limit', String(limit));
    params.append('page', '1');

    const response = await this.request<{ accounts: AccountingAccount[] }>(
      `/api/accounts?${params.toString()}`
    );
    return response.accounts || [];
  }

  async getFinancialSummary(): Promise<{
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  }> {
    const [bs, pl] = await Promise.all([
      this.request<{ data: { total: { assets: number; liabilities: number; equity: number } } }>(
        '/api/reports/balance-sheet?basis=accrual'
      ),
      this.request<{ data: { total: { income: number; expenses: number; netIncome: number } } }>(
        '/api/reports/profit-loss-sheet?basis=accrual'
      ),
    ]);

    return {
      totalAssets: bs.data?.total?.assets || 0,
      totalLiabilities: bs.data?.total?.liabilities || 0,
      totalEquity: bs.data?.total?.equity || 0,
      totalRevenue: pl.data?.total?.income || 0,
      totalExpenses: pl.data?.total?.expenses || 0,
      netIncome: pl.data?.total?.netIncome || 0,
    };
  }

  async generateReport(
    type: 'profit-loss' | 'balance-sheet' | 'trial-balance' | 'cashflow',
    startDate: string,
    endDate: string
  ): Promise<FinancialReport> {
    const endpointMap = {
      'profit-loss': '/api/reports/profit-loss-sheet',
      'balance-sheet': '/api/reports/balance-sheet',
      'trial-balance': '/api/reports/trial-balance-sheet',
      'cashflow': '/api/reports/cashflow-statement',
    };

    const response = await this.request<{
      query: { from_date: string; to_date: string };
      data: unknown[];
      meta: FinancialReport['meta'];
    }>(
      `${endpointMap[type]}?from_date=${startDate}&to_date=${endDate}&basis=accrual`
    );

    return {
      type,
      fromDate: startDate,
      toDate: endDate,
      currencyCode: 'USD',
      data: response.data || [],
      meta: response.meta || {
        organizationName: 'Perissos',
        baseCurrency: 'USD',
        formattedFromDate: startDate,
        formattedToDate: endDate,
        formattedDateRange: `From ${startDate} to ${endDate}`,
      },
    };
  }
}

// ============================================================================
// Factory
// ============================================================================

export function getAccountingAdapter(): AccountingAdapter {
  const provider = process.env.ACCOUNTING_PROVIDER || 'mock';

  if (provider === 'bigcapital') {
    return new BigcapitalAccountingAdapter();
  }

  return new MockAccountingAdapter();
}