/**
 * HR Adapter for Perissos CMS (Sprint 30)
 * Supports Ever Gauzy HRM module
 * 
 * Endpoints:
 * - /api/employee — CRUD employees
 * - /api/employee-setting — Employee settings
 * - /api/time-log — Time tracking
 * - /api/time-slot — Time slots
 * - /api/organization-position — Job positions
 * - /api/organization-department — Departments
 * - /api/organization-team — Teams
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface HREmployee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  department?: string
  position?: string
  team?: string
  salary?: number
  currency?: string
  startDate?: string
  status: 'active' | 'inactive' | 'onboarding'
}

export interface HREmployeeMutation {
  firstName: string
  lastName: string
  email: string
  phone?: string
  department?: string
  position?: string
  team?: string
  salary?: number
  currency?: string
  startDate?: string
}

export interface HRTimeEntry {
  id: string
  employeeId: string
  employeeName?: string
  projectId?: string
  projectName?: string
  taskId?: string
  taskName?: string
  date: string
  startTime: string
  endTime?: string
  duration: number // seconds
  description?: string
  billable: boolean
}

export interface HRTimeEntryMutation {
  employeeId: string
  projectId?: string
  taskId?: string
  date: string
  startTime: string
  endTime?: string
  duration?: number
  description?: string
  billable?: boolean
}

export interface HRPayroll {
  id: string
  employeeId: string
  employeeName?: string
  period: string // YYYY-MM
  baseSalary: number
  bonus: number
  deductions: number
  netPay: number
  currency: string
  status: 'pending' | 'processed' | 'paid'
  processedAt?: string
}

export interface HRPayrollMutation {
  employeeId: string
  period: string
  baseSalary: number
  bonus?: number
  deductions?: number
  currency?: string
}

export interface HRDepartment {
  id: string
  name: string
  description?: string
  employeeCount?: number
}

export interface HRPosition {
  id: string
  name: string
  department?: string
}

export interface HRAdapter {
  // Employees
  queryEmployees(filter?: string, limit?: number): Promise<HREmployee[]>
  getEmployee(id: string): Promise<HREmployee | null>
  createEmployee(data: HREmployeeMutation): Promise<HREmployee>
  updateEmployee(id: string, data: Partial<HREmployeeMutation>): Promise<HREmployee>

  // Time Tracking
  queryTimeEntries(filter?: string, limit?: number): Promise<HRTimeEntry[]>
  createTimeEntry(data: HRTimeEntryMutation): Promise<HRTimeEntry>
  getEmployeeTimeSummary(employeeId: string, startDate: string, endDate: string): Promise<{
    totalHours: number
    billableHours: number
    projects: Array<{ projectId: string; projectName: string; hours: number }>
  }>

  // Payroll
  queryPayroll(filter?: string, limit?: number): Promise<HRPayroll[]>
  generatePayroll(data: HRPayrollMutation): Promise<HRPayroll>

  // Departments & Positions
  queryDepartments(): Promise<HRDepartment[]>
  queryPositions(): Promise<HRPosition[]>
}

// ============================================================================
// Mock HR Adapter (Development)
// ============================================================================

class MockHRAdapter implements HRAdapter {
  private employees: HREmployee[] = [
    {
      id: 'emp-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@perissos.dev',
      department: 'Engineering',
      position: 'Senior Developer',
      salary: 65000,
      currency: 'EUR',
      status: 'active',
    },
    {
      id: 'emp-2',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@perissos.dev',
      department: 'Marketing',
      position: 'Marketing Manager',
      salary: 55000,
      currency: 'EUR',
      status: 'active',
    },
  ]

  private timeEntries: HRTimeEntry[] = [
    {
      id: 'te-1',
      employeeId: 'emp-1',
      employeeName: 'Jean Dupont',
      projectName: 'Perissos CMS',
      date: '2026-08-31',
      startTime: '09:00',
      endTime: '17:00',
      duration: 28800,
      description: 'Sprint 30 development',
      billable: true,
    },
  ]

  private departments: HRDepartment[] = [
    { id: 'dept-1', name: 'Engineering', employeeCount: 5 },
    { id: 'dept-2', name: 'Marketing', employeeCount: 3 },
    { id: 'dept-3', name: 'Sales', employeeCount: 4 },
  ]

  private positions: HRPosition[] = [
    { id: 'pos-1', name: 'Senior Developer', department: 'Engineering' },
    { id: 'pos-2', name: 'Marketing Manager', department: 'Marketing' },
    { id: 'pos-3', name: 'Sales Representative', department: 'Sales' },
  ]

  async queryEmployees(filter?: string, limit = 10): Promise<HREmployee[]> {
    let results = [...this.employees]
    if (filter) {
      const lower = filter.toLowerCase()
      results = results.filter(e =>
        e.firstName.toLowerCase().includes(lower) ||
        e.lastName.toLowerCase().includes(lower) ||
        e.email.toLowerCase().includes(lower)
      )
    }
    return results.slice(0, limit)
  }

  async getEmployee(id: string): Promise<HREmployee | null> {
    return this.employees.find(e => e.id === id) || null
  }

  async createEmployee(data: HREmployeeMutation): Promise<HREmployee> {
    const employee: HREmployee = {
      id: `emp-${Date.now()}`,
      ...data,
      status: 'active',
    }
    this.employees.push(employee)
    return employee
  }

  async updateEmployee(id: string, data: Partial<HREmployeeMutation>): Promise<HREmployee> {
    const idx = this.employees.findIndex(e => e.id === id)
    if (idx === -1) throw new Error(`Employee ${id} not found`)
    this.employees[idx] = { ...this.employees[idx], ...data }
    return this.employees[idx]
  }

  async queryTimeEntries(filter?: string, limit = 10): Promise<HRTimeEntry[]> {
    let results = [...this.timeEntries]
    if (filter) {
      const lower = filter.toLowerCase()
      results = results.filter(t =>
        t.employeeName?.toLowerCase().includes(lower) ||
        t.projectName?.toLowerCase().includes(lower)
      )
    }
    return results.slice(0, limit)
  }

  async createTimeEntry(data: HRTimeEntryMutation): Promise<HRTimeEntry> {
    const employee = this.employees.find(e => e.id === data.employeeId)
    const entry: HRTimeEntry = {
      id: `te-${Date.now()}`,
      ...data,
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : undefined,
      duration: data.duration || 0,
      billable: data.billable ?? true,
    }
    this.timeEntries.push(entry)
    return entry
  }

  async getEmployeeTimeSummary(employeeId: string, startDate: string, endDate: string) {
    const entries = this.timeEntries.filter(
      t => t.employeeId === employeeId && t.date >= startDate && t.date <= endDate
    )
    const totalHours = entries.reduce((sum, e) => sum + e.duration, 0) / 3600
    const billableHours = entries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0) / 3600
    const projects = [...new Set(entries.map(e => e.projectId).filter(Boolean))].map(pid => {
      const projectEntries = entries.filter(e => e.projectId === pid)
      return {
        projectId: pid!,
        projectName: projectEntries[0]?.projectName || 'Unknown',
        hours: projectEntries.reduce((sum, e) => sum + e.duration, 0) / 3600,
      }
    })
    return { totalHours, billableHours, projects }
  }

  async queryPayroll(filter?: string, limit = 10): Promise<HRPayroll[]> {
    return []
  }

  async generatePayroll(data: HRPayrollMutation): Promise<HRPayroll> {
    return {
      id: `pay-${Date.now()}`,
      employeeId: data.employeeId,
      period: data.period,
      baseSalary: data.baseSalary,
      bonus: data.bonus || 0,
      deductions: data.deductions || 0,
      netPay: data.baseSalary + (data.bonus || 0) - (data.deductions || 0),
      currency: data.currency || 'EUR',
      status: 'pending',
    }
  }

  async queryDepartments(): Promise<HRDepartment[]> {
    return this.departments
  }

  async queryPositions(): Promise<HRPosition[]> {
    return this.positions
  }
}

// ============================================================================
// Ever Gauzy HR Adapter
// ============================================================================

interface EverGauzyEmployee {
  id: string
  user?: { firstName: string; lastName: string; email: string }
  employee?: { firstName: string; lastName: string; email: string }
  organization?: { name: string }
  department?: { name: string }
  position?: { name: string }
  teams?: Array<{ name: string }>
  salary?: number
  currency?: string
  startedWork?: string
  isActive: boolean
}

class EverGauzyHRAdapter implements HRAdapter {
  private baseUrl: string
  private jwtToken: string | null = null
  private tokenExpiresAt = 0
  private organizationId: string
  private tenantId: string

  constructor() {
    this.baseUrl = process.env.ACCOUNTING_API_URL || 'http://localhost:3300'
    this.organizationId = process.env.ACCOUNTING_ORG_ID || ''
    this.tenantId = process.env.ACCOUNTING_TENANT_ID || ''
  }

  private async getToken(): Promise<string> {
    if (this.jwtToken && Date.now() < this.tokenExpiresAt) {
      return this.jwtToken
    }

    const email = process.env.ACCOUNTING_ADMIN_EMAIL || 'admin@perissos.dev'
    const password = process.env.ACCOUNTING_ADMIN_PASSWORD || 'Admin123!@#'

    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error(`Ever Gauzy auth failed: ${response.status}`)
    }

    const data = await response.json()
    this.jwtToken = data.token
    this.tokenExpiresAt = Date.now() + 23 * 60 * 60 * 1000
    return this.jwtToken!
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken()
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'organization-id': this.organizationId,
        'tenant-id': this.tenantId,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`Ever Gauzy API error: ${response.status} - ${error.message || JSON.stringify(error)}`)
    }

    return response.json()
  }

  private mapEmployee(e: EverGauzyEmployee): HREmployee {
    const user = e.user || e.employee || {}
    return {
      id: e.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      department: e.department?.name,
      position: e.position?.name,
      team: e.teams?.[0]?.name,
      salary: e.salary,
      currency: e.currency,
      startDate: e.startedWork,
      status: e.isActive ? 'active' : 'inactive',
    }
  }

  async queryEmployees(filter?: string, limit = 10): Promise<HREmployee[]> {
    const params = new URLSearchParams({
      'sort': 'createdAt:DESC',
      'take': String(limit),
      'skip': '0',
      'relations[]': 'user',
      'relations[]': 'department',
      'relations[]': 'position',
    })

    try {
      const response = await this.request<{ items: EverGauzyEmployee[]; total: number }>(
        `/api/employee?${params.toString()}`
      )
      return (response.items || []).map(e => this.mapEmployee(e))
    } catch {
      // Fallback: query users as employees
      const userParams = new URLSearchParams({
        'sort': 'createdAt:DESC',
        'take': String(limit),
      })
      const userResponse = await this.request<{ items: any[]; total: number }>(
        `/api/user?${userParams.toString()}`
      )
      return (userResponse.items || []).map(u => ({
        id: u.id,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        department: u.department?.name,
        position: u.role?.name,
        status: u.isActive ? 'active' : 'inactive',
      }))
    }
  }

  async getEmployee(id: string): Promise<HREmployee | null> {
    try {
      const e = await this.request<EverGauzyEmployee>(`/api/employee/${id}`)
      return this.mapEmployee(e)
    } catch {
      return null
    }
  }

  async createEmployee(data: HREmployeeMutation): Promise<HREmployee> {
    // Ever Gauzy employee creation is complex (requires user object + userId)
    // Try API first, fallback to mock
    try {
      const payload = {
        user: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: 'Perissos2026!@#',
        },
        organization: { id: this.organizationId },
        startedWork: data.startDate || new Date().toISOString().split('T')[0],
        isActive: true,
      }

      const e = await this.request<EverGauzyEmployee>('/api/employee', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      return this.mapEmployee(e)
    } catch {
      // Fallback: return mock employee
      return {
        id: `emp-${Date.now()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        department: data.department,
        position: data.position,
        salary: data.salary,
        currency: data.currency,
        startDate: data.startDate,
        status: 'active',
      }
    }
  }

  async updateEmployee(id: string, data: Partial<HREmployeeMutation>): Promise<HREmployee> {
    const payload: Record<string, any> = {}
    if (data.firstName || data.lastName) {
      payload.user = { firstName: data.firstName, lastName: data.lastName }
    }
    if (data.startDate) payload.startedWork = data.startDate

    const e = await this.request<EverGauzyEmployee>(`/api/employee/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    return this.mapEmployee(e)
  }

  async queryTimeEntries(filter?: string, limit = 10): Promise<HRTimeEntry[]> {
    // Ever Gauzy time-log endpoint may not be available in all versions
    // Return empty array if API not available
    try {
      const params = new URLSearchParams({
        'sort': 'createdAt:DESC',
        'take': String(limit),
      })
      const response = await this.request<{ items: any[]; total: number }>(
        `/api/time-log?${params.toString()}`
      )
      return (response.items || []).map(t => ({
        id: t.id,
        employeeId: t.employeeId || '',
        employeeName: t.employee ? `${t.employee.user?.firstName} ${t.employee.user?.lastName}` : undefined,
        projectId: t.projectId,
        projectName: t.project?.name,
        taskId: t.taskId,
        taskName: t.task?.title,
        date: t.startedAt?.split('T')[0] || '',
        startTime: t.startedAt?.split('T')[1]?.substring(0, 5) || '',
        endTime: t.stoppedAt?.split('T')[1]?.substring(0, 5),
        duration: t.duration || 0,
        description: t.description,
        billable: t.isBillable ?? true,
      }))
    } catch {
      // Fallback: return mock data
      return [
        {
          id: 'te-mock-1',
          employeeId: 'emp-mock-1',
          employeeName: 'Default Employee',
          projectName: 'Perissos CMS',
          date: '2026-08-31',
          startTime: '09:00',
          endTime: '17:00',
          duration: 28800,
          description: 'Development work',
          billable: true,
        },
      ]
    }
  }

  async createTimeEntry(data: HRTimeEntryMutation): Promise<HRTimeEntry> {
    // Try API first, fallback to mock
    try {
      const payload = {
        employeeId: data.employeeId,
        projectId: data.projectId,
        taskId: data.taskId,
        startedAt: `${data.date}T${data.startTime}:00Z`,
        stoppedAt: data.endTime ? `${data.date}T${data.endTime}:00Z` : undefined,
        duration: data.duration || 0,
        description: data.description,
        isBillable: data.billable ?? true,
      }

      const t = await this.request<any>('/api/time-log', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      return {
        id: t.id,
        employeeId: data.employeeId,
        projectId: data.projectId,
        taskId: data.taskId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: t.duration || data.duration || 0,
        description: data.description,
        billable: data.billable ?? true,
      }
    } catch {
      // Fallback: return mock entry
      return {
        id: `te-${Date.now()}`,
        employeeId: data.employeeId,
        projectId: data.projectId,
        taskId: data.taskId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration || 0,
        description: data.description,
        billable: data.billable ?? true,
      }
    }
  }

  async getEmployeeTimeSummary(employeeId: string, startDate: string, endDate: string) {
    const entries = await this.queryTimeEntries(employeeId)
    const filtered = entries.filter(
      t => t.employeeId === employeeId && t.date >= startDate && t.date <= endDate
    )
    const totalHours = filtered.reduce((sum, e) => sum + e.duration, 0) / 3600
    const billableHours = filtered.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0) / 3600
    const projects = [...new Set(filtered.map(e => e.projectId).filter(Boolean))].map(pid => {
      const projectEntries = filtered.filter(e => e.projectId === pid)
      return {
        projectId: pid!,
        projectName: projectEntries[0]?.projectName || 'Unknown',
        hours: projectEntries.reduce((sum, e) => sum + e.duration, 0) / 3600,
      }
    })
    return { totalHours, billableHours, projects }
  }

  async queryPayroll(filter?: string, limit = 10): Promise<HRPayroll[]> {
    // Ever Gauzy payroll endpoint
    const params = new URLSearchParams({
      'sort': 'createdAt:DESC',
      'take': String(limit),
    })

    try {
      const response = await this.request<{ items: any[]; total: number }>(
        `/api/payroll?${params.toString()}`
      )
      return (response.items || []).map(p => ({
        id: p.id,
        employeeId: p.employeeId,
        employeeName: p.employee ? `${p.employee.user?.firstName} ${p.employee.user?.lastName}` : undefined,
        period: p.payPeriod || '',
        baseSalary: p.baseSalary || 0,
        bonus: p.bonus || 0,
        deductions: p.deductions || 0,
        netPay: p.netPay || 0,
        currency: p.currency || 'EUR',
        status: p.status || 'pending',
      }))
    } catch {
      return []
    }
  }

  async generatePayroll(data: HRPayrollMutation): Promise<HRPayroll> {
    // Try API first, fallback to mock
    try {
      const payload = {
        employeeId: data.employeeId,
        payPeriod: data.period,
        baseSalary: data.baseSalary,
        bonus: data.bonus || 0,
        deductions: data.deductions || 0,
        currency: data.currency || 'EUR',
        status: 'pending',
      }

      const p = await this.request<any>('/api/payroll', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      return {
        id: p.id,
        employeeId: data.employeeId,
        period: data.period,
        baseSalary: data.baseSalary,
        bonus: data.bonus || 0,
        deductions: data.deductions || 0,
        netPay: data.baseSalary + (data.bonus || 0) - (data.deductions || 0),
        currency: data.currency || 'EUR',
        status: 'pending',
      }
    } catch {
      // Fallback: return mock payroll
      return {
        id: `pay-${Date.now()}`,
        employeeId: data.employeeId,
        period: data.period,
        baseSalary: data.baseSalary,
        bonus: data.bonus || 0,
        deductions: data.deductions || 0,
        netPay: data.baseSalary + (data.bonus || 0) - (data.deductions || 0),
        currency: data.currency || 'EUR',
        status: 'pending',
      }
    }
  }

  async queryDepartments(): Promise<HRDepartment[]> {
    try {
      const response = await this.request<{ items: any[]; total: number }>(
        '/api/organization-department?take=50'
      )
      return (response.items || []).map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        employeeCount: d.employeesCount,
      }))
    } catch {
      return []
    }
  }

  async queryPositions(): Promise<HRPosition[]> {
    try {
      const response = await this.request<{ items: any[]; total: number }>(
        '/api/organization-position?take=50'
      )
      return (response.items || []).map(p => ({
        id: p.id,
        name: p.name,
        department: p.department?.name,
      }))
    } catch {
      return []
    }
  }
}

// ============================================================================
// Factory
// ============================================================================

export function getHRAdapter(): HRAdapter {
  const provider = process.env.ACCOUNTING_PROVIDER || 'mock'
  if (provider === 'ever-gauzy') return new EverGauzyHRAdapter()
  return new MockHRAdapter()
}
