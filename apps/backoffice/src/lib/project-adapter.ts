/**
 * Project Adapter for Perissos CMS (Sprint 31)
 * Supports Ever Gauzy Project Management module
 * 
 * Endpoints:
 * - /api/tasks — Task CRUD
 * - /api/organization-team — Teams
 * - /api/organization-sprint — Sprints
 * - /api/task-status — Task statuses
 * - /api/task-size — Task sizes
 * - /api/task-version — Task versions
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  startDate?: string
  endDate?: string
  budget?: number
  currency?: string
  teamId?: string
  teamName?: string
  taskCount?: number
  completedTasks?: number
}

export interface ProjectMutation {
  name: string
  description?: string
  startDate?: string
  endDate?: string
  budget?: number
  currency?: string
  teamId?: string
}

export interface ProjectTask {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  projectId?: string
  projectName?: string
  assigneeId?: string
  assigneeName?: string
  estimate?: number
  dueDate?: string
  tags?: string[]
  createdAt: string
  updatedAt?: string
}

export interface ProjectTaskMutation {
  title: string
  description?: string
  status?: string
  priority?: string
  projectId?: string
  assigneeId?: string
  estimate?: number
  dueDate?: string
  tags?: string[]
}

export interface ProjectTimeEntry {
  id: string
  taskId: string
  taskTitle?: string
  employeeId: string
  employeeName?: string
  date: string
  startTime: string
  endTime?: string
  duration: number // seconds
  description?: string
  billable: boolean
}

export interface ProjectSprint {
  id: string
  name: string
  startDate?: string
  endDate?: string
  status: 'future' | 'active' | 'completed'
  taskCount?: number
}

export interface ProjectTeam {
  id: string
  name: string
  memberCount?: number
  taskCount?: number
}

export interface ProjectAdapter {
  // Projects
  queryProjects(filter?: string, limit?: number): Promise<Project[]>
  getProject(id: string): Promise<Project | null>
  createProject(data: ProjectMutation): Promise<Project>

  // Tasks
  queryTasks(filter?: string, limit?: number): Promise<ProjectTask[]>
  getTask(id: string): Promise<ProjectTask | null>
  createTask(data: ProjectTaskMutation): Promise<ProjectTask>
  updateTask(id: string, data: Partial<ProjectTaskMutation>): Promise<ProjectTask>
  assignTask(taskId: string, employeeId: string): Promise<ProjectTask>

  // Time Tracking
  getTaskTimeEntries(taskId: string): Promise<ProjectTimeEntry[]>
  logTime(data: {
    taskId: string
    employeeId: string
    date: string
    duration: number
    description?: string
  }): Promise<ProjectTimeEntry>

  // Sprints
  querySprints(): Promise<ProjectSprint[]>

  // Teams
  queryTeams(): Promise<ProjectTeam[]>
}

// ============================================================================
// Mock Project Adapter (Development)
// ============================================================================

class MockProjectAdapter implements ProjectAdapter {
  private projects: Project[] = [
    {
      id: 'proj-1',
      name: 'Perissos CMS',
      description: 'Digital AI Agency Platform',
      status: 'active',
      startDate: '2026-01-01',
      budget: 100000,
      currency: 'EUR',
      taskCount: 45,
      completedTasks: 30,
    },
    {
      id: 'proj-2',
      name: 'Client Website',
      description: 'E-commerce website for client',
      status: 'active',
      startDate: '2026-08-01',
      budget: 25000,
      currency: 'EUR',
      taskCount: 12,
      completedTasks: 5,
    },
  ]

  private tasks: ProjectTask[] = [
    {
      id: 'task-1',
      title: 'Implement CRM Integration',
      description: 'Connect Twenty CRM to Ever Gauzy',
      status: 'done',
      priority: 'high',
      projectId: 'proj-1',
      projectName: 'Perissos CMS',
      assigneeId: 'emp-1',
      assigneeName: 'Jean Dupont',
      estimate: 16,
      createdAt: '2026-08-15T10:00:00Z',
    },
    {
      id: 'task-2',
      title: 'Design Dashboard',
      description: 'Create analytics dashboard',
      status: 'in_progress',
      priority: 'medium',
      projectId: 'proj-1',
      projectName: 'Perissos CMS',
      assigneeId: 'emp-2',
      assigneeName: 'Marie Martin',
      estimate: 8,
      createdAt: '2026-08-20T14:00:00Z',
    },
  ]

  private sprints: ProjectSprint[] = [
    { id: 'sprint-1', name: 'Sprint 30', startDate: '2026-08-25', endDate: '2026-08-31', status: 'completed', taskCount: 10 },
    { id: 'sprint-2', name: 'Sprint 31', startDate: '2026-09-01', endDate: '2026-09-07', status: 'active', taskCount: 8 },
  ]

  private teams: ProjectTeam[] = [
    { id: 'team-1', name: 'Engineering', memberCount: 5, taskCount: 20 },
    { id: 'team-2', name: 'Marketing', memberCount: 3, taskCount: 8 },
  ]

  async queryProjects(filter?: string, limit = 10): Promise<Project[]> {
    let results = [...this.projects]
    if (filter) {
      const lower = filter.toLowerCase()
      results = results.filter(p => p.name.toLowerCase().includes(lower))
    }
    return results.slice(0, limit)
  }

  async getProject(id: string): Promise<Project | null> {
    return this.projects.find(p => p.id === id) || null
  }

  async createProject(data: ProjectMutation): Promise<Project> {
    const project: Project = {
      id: `proj-${Date.now()}`,
      ...data,
      status: 'active',
      taskCount: 0,
      completedTasks: 0,
    }
    this.projects.push(project)
    return project
  }

  async queryTasks(filter?: string, limit = 10): Promise<ProjectTask[]> {
    let results = [...this.tasks]
    if (filter) {
      const lower = filter.toLowerCase()
      results = results.filter(t =>
        t.title.toLowerCase().includes(lower) ||
        t.projectName?.toLowerCase().includes(lower)
      )
    }
    return results.slice(0, limit)
  }

  async getTask(id: string): Promise<ProjectTask | null> {
    return this.tasks.find(t => t.id === id) || null
  }

  async createTask(data: ProjectTaskMutation): Promise<ProjectTask> {
    const task: ProjectTask = {
      id: `task-${Date.now()}`,
      ...data,
      status: data.status || 'open',
      createdAt: new Date().toISOString(),
    }
    this.tasks.push(task)
    return task
  }

  async updateTask(id: string, data: Partial<ProjectTaskMutation>): Promise<ProjectTask> {
    const idx = this.tasks.findIndex(t => t.id === id)
    if (idx === -1) throw new Error(`Task ${id} not found`)
    this.tasks[idx] = { ...this.tasks[idx], ...data, updatedAt: new Date().toISOString() }
    return this.tasks[idx]
  }

  async assignTask(taskId: string, employeeId: string): Promise<ProjectTask> {
    return this.updateTask(taskId, { assigneeId: employeeId })
  }

  async getTaskTimeEntries(taskId: string): Promise<ProjectTimeEntry[]> {
    return [
      {
        id: 'te-1',
        taskId,
        taskTitle: this.tasks.find(t => t.id === taskId)?.title,
        employeeId: 'emp-1',
        employeeName: 'Jean Dupont',
        date: '2026-08-31',
        startTime: '09:00',
        endTime: '12:00',
        duration: 10800,
        description: 'Development work',
        billable: true,
      },
    ]
  }

  async logTime(data: { taskId: string; employeeId: string; date: string; duration: number; description?: string }): Promise<ProjectTimeEntry> {
    return {
      id: `te-${Date.now()}`,
      ...data,
      startTime: '09:00',
      billable: true,
    }
  }

  async querySprints(): Promise<ProjectSprint[]> {
    return this.sprints
  }

  async queryTeams(): Promise<ProjectTeam[]> {
    return this.teams
  }
}

// ============================================================================
// Ever Gauzy Project Adapter
// ============================================================================

class EverGauzyProjectAdapter implements ProjectAdapter {
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

  async queryProjects(filter?: string, limit = 10): Promise<Project[]> {
    // Ever Gauzy may not have a project endpoint in all versions
    // Fallback to empty array
    try {
      const params = new URLSearchParams({
        'sort': 'createdAt:DESC',
        'take': String(limit),
      })
      const response = await this.request<{ items: any[]; total: number }>(
        `/api/project?${params.toString()}`
      )
      return (response.items || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.isActive ? 'active' : 'archived',
        startDate: p.startDate,
        endDate: p.endDate,
        budget: p.budget,
        currency: p.currency,
        taskCount: p.tasksCount,
      }))
    } catch {
      return []
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const p = await this.request<any>(`/api/project/${id}`)
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.isActive ? 'active' : 'archived',
        startDate: p.startDate,
        endDate: p.endDate,
        budget: p.budget,
        currency: p.currency,
        taskCount: p.tasksCount,
      }
    } catch {
      return null
    }
  }

  async createProject(data: ProjectMutation): Promise<Project> {
    // Try API, fallback to mock
    try {
      const payload = {
        name: data.name,
        description: data.description,
        organizationId: this.organizationId,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        currency: data.currency,
      }

      const p = await this.request<any>('/api/project', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: 'active',
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        currency: data.currency,
      }
    } catch {
      return {
        id: `proj-${Date.now()}`,
        name: data.name,
        description: data.description,
        status: 'active',
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        currency: data.currency,
      }
    }
  }

  async queryTasks(filter?: string, limit = 10): Promise<ProjectTask[]> {
    try {
      const params = new URLSearchParams({
        'sort': 'createdAt:DESC',
        'take': String(limit),
      })
      const response = await this.request<{ items: any[]; total: number }>(
        `/api/tasks?${params.toString()}`
      )
      return (response.items || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        projectName: t.project?.name,
        assigneeId: t.assigneeId,
        assigneeName: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : undefined,
        estimate: t.estimate,
        dueDate: t.dueDate,
        tags: t.tags,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }))
    } catch {
      return []
    }
  }

  async getTask(id: string): Promise<ProjectTask | null> {
    try {
      const t = await this.request<any>(`/api/tasks/${id}`)
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        projectName: t.project?.name,
        assigneeId: t.assigneeId,
        assigneeName: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : undefined,
        estimate: t.estimate,
        dueDate: t.dueDate,
        tags: t.tags,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }
    } catch {
      return null
    }
  }

  async createTask(data: ProjectTaskMutation): Promise<ProjectTask> {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        status: data.status || 'open',
        priority: data.priority,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        estimate: data.estimate,
        dueDate: data.dueDate,
        organizationId: this.organizationId,
      }

      const t = await this.request<any>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        createdAt: t.createdAt,
      }
    } catch {
      return {
        id: `task-${Date.now()}`,
        title: data.title,
        description: data.description,
        status: data.status || 'open',
        priority: data.priority,
        projectId: data.projectId,
        createdAt: new Date().toISOString(),
      }
    }
  }

  async updateTask(id: string, data: Partial<ProjectTaskMutation>): Promise<ProjectTask> {
    try {
      const payload: Record<string, any> = {}
      if (data.title) payload.title = data.title
      if (data.description) payload.description = data.description
      if (data.status) payload.status = data.status
      if (data.priority) payload.priority = data.priority
      if (data.assigneeId) payload.assigneeId = data.assigneeId

      const t = await this.request<any>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }
    } catch {
      return {
        id,
        title: data.title || '',
        description: data.description,
        status: data.status || 'open',
        priority: data.priority,
        createdAt: new Date().toISOString(),
      }
    }
  }

  async assignTask(taskId: string, employeeId: string): Promise<ProjectTask> {
    return this.updateTask(taskId, { assigneeId: employeeId })
  }

  async getTaskTimeEntries(taskId: string): Promise<ProjectTimeEntry[]> {
    try {
      const response = await this.request<{ items: any[]; total: number }>(
        `/api/tasks/${taskId}/time-logs`
      )
      return (response.items || []).map(t => ({
        id: t.id,
        taskId,
        employeeId: t.employeeId,
        employeeName: t.employee ? `${t.employee.user?.firstName} ${t.employee.user?.lastName}` : undefined,
        date: t.startedAt?.split('T')[0] || '',
        startTime: t.startedAt?.split('T')[1]?.substring(0, 5) || '',
        duration: t.duration || 0,
        description: t.description,
        billable: t.isBillable ?? true,
      }))
    } catch {
      return []
    }
  }

  async logTime(data: { taskId: string; employeeId: string; date: string; duration: number; description?: string }): Promise<ProjectTimeEntry> {
    try {
      const payload = {
        taskId: data.taskId,
        employeeId: data.employeeId,
        startedAt: `${data.date}T09:00:00Z`,
        duration: data.duration,
        description: data.description,
        isBillable: true,
      }

      const t = await this.request<any>('/api/time-log', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      return {
        id: t.id,
        taskId: data.taskId,
        employeeId: data.employeeId,
        date: data.date,
        startTime: '09:00',
        duration: data.duration,
        description: data.description,
        billable: true,
      }
    } catch {
      return {
        id: `te-${Date.now()}`,
        taskId: data.taskId,
        employeeId: data.employeeId,
        date: data.date,
        startTime: '09:00',
        duration: data.duration,
        description: data.description,
        billable: true,
      }
    }
  }

  async querySprints(): Promise<ProjectSprint[]> {
    try {
      const response = await this.request<{ items: any[]; total: number }>(
        '/api/organization-sprint?take=50'
      )
      return (response.items || []).map(s => ({
        id: s.id,
        name: s.name,
        startDate: s.startDate,
        endDate: s.endDate,
        status: s.isFinish ? 'completed' : 'active',
        taskCount: s.tasksCount,
      }))
    } catch {
      return []
    }
  }

  async queryTeams(): Promise<ProjectTeam[]> {
    try {
      const response = await this.request<{ items: any[]; total: number }>(
        '/api/organization-team?take=50'
      )
      return (response.items || []).map(t => ({
        id: t.id,
        name: t.name,
        memberCount: t.membersCount,
        taskCount: t.tasksCount,
      }))
    } catch {
      return []
    }
  }
}

// ============================================================================
// Factory
// ============================================================================

export function getProjectAdapter(): ProjectAdapter {
  const provider = process.env.ACCOUNTING_PROVIDER || 'mock'
  if (provider === 'ever-gauzy') return new EverGauzyProjectAdapter()
  return new MockProjectAdapter()
}
