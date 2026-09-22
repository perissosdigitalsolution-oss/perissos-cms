export interface CRMContact {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  phone?: string
  dealAmount?: number
  stage?: string
  source?: string
  createdAt?: string
}

export interface CRMOpportunity {
  id: string
  name: string
  contactId: string
  amount: number
  currency: string
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  description?: string
  expectedCloseDate?: string
  contactName?: string
  contactEmail?: string
  createdAt: string
  updatedAt?: string
}

export interface CRMOpportunityMutation {
  contactId: string
  name: string
  amount: number
  currency?: string
  stage?: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  description?: string
  expectedCloseDate?: string
}

export interface CRMQueryResult {
  contacts: CRMContact[]
  count: number
  source: 'mock' | 'twenty' | 'perissos-crm'
  query?: string
}

export interface CRMOpportunityQueryResult {
  opportunities: CRMOpportunity[]
  count: number
  source: 'mock' | 'twenty' | 'perissos-crm'
  query?: string
}

export interface CRMContactMutation {
  firstName?: string
  lastName?: string
  email?: string
  company?: string
  phone?: string
  dealAmount?: number
  stage?: string
  source?: string
}

export interface CRMActionResult {
  success: boolean
  contact?: CRMContact
  opportunity?: CRMOpportunity
  error?: string
}

export interface CRMAdapter {
  // Contacts
  queryContacts(filter?: string, limit?: number): Promise<CRMContact[]>
  getContact(id: string): Promise<CRMContact | null>
  createContact(data: CRMContactMutation): Promise<CRMContact>
  updateContact(id: string, data: CRMContactMutation): Promise<CRMContact>
  deleteContact(id: string): Promise<boolean>

  // Opportunities
  queryOpportunities(filter?: string, limit?: number): Promise<CRMOpportunity[]>
  getOpportunity(id: string): Promise<CRMOpportunity | null>
  createOpportunity(data: CRMOpportunityMutation): Promise<CRMOpportunity>
  updateOpportunity(id: string, data: CRMOpportunityMutation): Promise<CRMOpportunity>
  deleteOpportunity(id: string): Promise<boolean>
}

let mockContacts: CRMContact[] = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@acme.com',
    company: 'Acme Inc',
    phone: '+33 6 12 34 56 78',
    dealAmount: 25000,
    stage: 'proposal',
    source: 'website',
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@beta-corp.fr',
    company: 'Beta Corp',
    phone: '+33 6 98 76 54 32',
    dealAmount: 48000,
    stage: 'negotiation',
    source: 'referral',
    createdAt: '2026-08-10T14:30:00Z',
  },
  {
    id: '3',
    firstName: 'Pierre',
    lastName: 'Bernard',
    email: 'p.bernard@gamma.io',
    company: 'Gamma.io',
    phone: '+33 6 11 22 33 44',
    dealAmount: 12000,
    stage: 'lead',
    source: 'linkedin',
    createdAt: '2026-08-20T09:15:00Z',
  },
  {
    id: '4',
    firstName: 'Sophie',
    lastName: 'Dubois',
    email: 'sophie@delta-solutions.com',
    company: 'Delta Solutions',
    phone: '+33 6 55 66 77 88',
    dealAmount: 75000,
    stage: 'closed_won',
    source: 'conference',
    createdAt: '2026-07-28T16:45:00Z',
  },
  {
    id: '5',
    firstName: 'Lucas',
    lastName: 'Moreau',
    email: 'lucas.moreau@epsilon.fr',
    company: 'Epsilon SA',
    phone: '+33 6 44 33 22 11',
    dealAmount: 33000,
    stage: 'proposal',
    source: 'website',
    createdAt: '2026-08-22T11:00:00Z',
  },
]

let mockOpportunities: CRMOpportunity[] = [
  {
    id: '1',
    name: 'Acme Inc - Website Redesign',
    contactId: '1',
    amount: 25000,
    currency: 'EUR',
    stage: 'proposal',
    description: 'Complete website redesign with CMS integration',
    expectedCloseDate: '2026-09-15',
    contactName: 'Jean Dupont',
    contactEmail: 'jean.dupont@acme.com',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Beta Corp - ERP Implementation',
    contactId: '2',
    amount: 48000,
    currency: 'EUR',
    stage: 'negotiation',
    description: 'Full ERP implementation with training',
    expectedCloseDate: '2026-10-01',
    contactName: 'Marie Martin',
    contactEmail: 'marie.martin@beta-corp.fr',
    createdAt: '2026-08-10T14:30:00Z',
    updatedAt: '2026-08-12T09:00:00Z',
  },
  {
    id: '3',
    name: 'Gamma.io - Mobile App Development',
    contactId: '3',
    amount: 12000,
    currency: 'EUR',
    stage: 'lead',
    description: 'React Native mobile app for iOS/Android',
    expectedCloseDate: '2026-11-15',
    contactName: 'Pierre Bernard',
    contactEmail: 'p.bernard@gamma.io',
    createdAt: '2026-08-20T09:15:00Z',
    updatedAt: '2026-08-20T09:15:00Z',
  },
]

let mockIdCounter = 6
let mockOppIdCounter = 4

export class MockCRMAdapter implements CRMAdapter {
  async queryContacts(filter?: string, limit?: number): Promise<CRMContact[]> {
    let results = [...mockContacts]

    if (filter) {
      const lowerFilter = filter.toLowerCase()
      results = results.filter(
        (c) =>
          c.firstName.toLowerCase().includes(lowerFilter) ||
          c.lastName.toLowerCase().includes(lowerFilter) ||
          c.email.toLowerCase().includes(lowerFilter) ||
          c.company?.toLowerCase().includes(lowerFilter)
      )
    }

    if (limit && limit > 0) {
      results = results.slice(0, limit)
    }

    return results
  }

  async getContact(id: string): Promise<CRMContact | null> {
    return mockContacts.find((c) => c.id === id) || null
  }

  async createContact(data: CRMContactMutation): Promise<CRMContact> {
    const contact: CRMContact = {
      id: String(mockIdCounter++),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      company: data.company,
      phone: data.phone,
      dealAmount: data.dealAmount,
      stage: data.stage || 'lead',
      source: data.source || 'ai_assistant',
      createdAt: new Date().toISOString(),
    }
    mockContacts.push(contact)
    return contact
  }

  async updateContact(id: string, data: CRMContactMutation): Promise<CRMContact> {
    const idx = mockContacts.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error(`Contact ${id} not found`)
    mockContacts[idx] = { ...mockContacts[idx], ...data, id }
    return mockContacts[idx]
  }

  async deleteContact(id: string): Promise<boolean> {
    const idx = mockContacts.findIndex((c) => c.id === id)
    if (idx === -1) return false
    mockContacts.splice(idx, 1)
    return true
  }

  // Opportunities
  async queryOpportunities(filter?: string, limit?: number): Promise<CRMOpportunity[]> {
    let results = [...mockOpportunities]

    if (filter) {
      const lowerFilter = filter.toLowerCase()
      results = results.filter(
        (o) =>
          o.name.toLowerCase().includes(lowerFilter) ||
          o.contactName?.toLowerCase().includes(lowerFilter) ||
          o.contactEmail?.toLowerCase().includes(lowerFilter) ||
          o.stage.toLowerCase().includes(lowerFilter)
      )
    }

    if (limit && limit > 0) {
      results = results.slice(0, limit)
    }

    return results
  }

  async getOpportunity(id: string): Promise<CRMOpportunity | null> {
    return mockOpportunities.find((o) => o.id === id) || null
  }

  async createOpportunity(data: CRMOpportunityMutation): Promise<CRMOpportunity> {
    const contact = mockContacts.find((c) => c.id === data.contactId)
    const opportunity: CRMOpportunity = {
      id: String(mockOppIdCounter++),
      name: data.name,
      contactId: data.contactId,
      amount: data.amount,
      currency: data.currency || 'EUR',
      stage: data.stage || 'lead',
      description: data.description,
      expectedCloseDate: data.expectedCloseDate,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : undefined,
      contactEmail: contact?.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockOpportunities.push(opportunity)
    return opportunity
  }

  async updateOpportunity(id: string, data: CRMOpportunityMutation): Promise<CRMOpportunity> {
    const idx = mockOpportunities.findIndex((o) => o.id === id)
    if (idx === -1) throw new Error(`Opportunity ${id} not found`)
    
    const contact = mockContacts.find((c) => c.id === data.contactId)
    mockOpportunities[idx] = {
      ...mockOpportunities[idx],
      ...data,
      id,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : mockOpportunities[idx].contactName,
      contactEmail: contact?.email || mockOpportunities[idx].contactEmail,
      updatedAt: new Date().toISOString(),
    }
    return mockOpportunities[idx]
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    const idx = mockOpportunities.findIndex((o) => o.id === id)
    if (idx === -1) return false
    mockOpportunities.splice(idx, 1)
    return true
  }
}

export class TwentyCRMAdapter implements CRMAdapter {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.TWENTY_API_URL || 'http://localhost:3000'
    this.apiKey = process.env.TWENTY_API_KEY || ''
  }

  async queryContacts(filter?: string, limit?: number): Promise<CRMContact[]> {
    try {
      const query = `
        query GetPeople($filter: PersonFilterInput, $limit: Int) {
          people(filter: $filter, limit: $limit) {
            edges {
              node {
                id
                name { firstName lastName }
                emails { primaryEmail }
                phones { primaryPhone }
                company { name }
              }
            }
            totalCount
          }
        }
      `

      const variables: Record<string, any> = {}
      if (limit) variables.limit = limit
      if (filter) {
        variables.filter = {
          or: [
            { name: { firstName: { like: `%${filter}%` } } },
            { name: { lastName: { like: `%${filter}%` } } },
            { emails: { primaryEmail: { like: `%${filter}%` } } },
          ],
        }
      }

      const res = await fetch(`${this.baseUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ query, variables }),
      })

      if (!res.ok) throw new Error(`Twenty API error: ${res.status}`)

      const data = await res.json()
      const people = data.data?.people?.edges || []

      return people.map((edge: any) => ({
        id: edge.node.id,
        firstName: edge.node.name?.firstName || '',
        lastName: edge.node.name?.lastName || '',
        email: edge.node.emails?.primaryEmail || '',
        company: edge.node.company?.name,
        phone: edge.node.phones?.primaryPhone,
      }))
    } catch (err) {
      console.error('[TwentyCRM] Query failed:', err)
      return []
    }
  }

  async getContact(id: string): Promise<CRMContact | null> {
    try {
      const query = `
        query GetPerson($id: ID!) {
          person(filter: { id: { eq: $id } }) {
            id
            name { firstName lastName }
            emails { primaryEmail }
            phones { primaryPhone }
            company { name }
          }
        }
      `

      const res = await fetch(`${this.baseUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ query, variables: { id } }),
      })

      if (!res.ok) return null

      const data = await res.json()
      const person = data.data?.person
      if (!person) return null

      return {
        id: person.id,
        firstName: person.name?.firstName || '',
        lastName: person.name?.lastName || '',
        email: person.emails?.primaryEmail || '',
        company: person.company?.name,
        phone: person.phones?.primaryPhone,
      }
    } catch {
      return null
    }
  }

  async createContact(data: CRMContactMutation): Promise<CRMContact> {
    const mutation = `
      mutation CreatePerson($input: PersonCreateInput!) {
        createPerson(data: $input) {
          id
          name { firstName lastName }
          emails { primaryEmail }
          phones { primaryPhone }
          company { name }
        }
      }
    `
    const res = await fetch(`${this.baseUrl}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            name: { firstName: data.firstName || '', lastName: data.lastName || '' },
            emails: { primaryEmail: data.email || '' },
            phones: { primaryPhone: data.phone || '' },
          },
        },
      }),
    })
    if (!res.ok) throw new Error(`Create contact failed: ${res.status}`)
    const result = await res.json()
    const person = result.data?.createPerson
    if (!person) throw new Error('Create returned no data')
    return {
      id: person.id,
      firstName: person.name?.firstName || '',
      lastName: person.name?.lastName || '',
      email: person.emails?.primaryEmail || '',
      company: person.company?.name,
      phone: person.phones?.primaryPhone,
    }
  }

  async updateContact(id: string, data: CRMContactMutation): Promise<CRMContact> {
    const mutation = `
      mutation UpdatePerson($id: ID!, $input: PersonUpdateInput!) {
        updatePerson(id: $id, data: $input) {
          id
          name { firstName lastName }
          emails { primaryEmail }
          phones { primaryPhone }
          company { name }
        }
      }
    `
    const input: Record<string, any> = {}
    if (data.firstName || data.lastName) input.name = { firstName: data.firstName, lastName: data.lastName }
    if (data.email) input.emails = { primaryEmail: data.email }
    if (data.phone) input.phones = { primaryPhone: data.phone }

    const res = await fetch(`${this.baseUrl}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ query: mutation, variables: { id, input } }),
    })
    if (!res.ok) throw new Error(`Update contact failed: ${res.status}`)
    const result = await res.json()
    const person = result.data?.updatePerson
    if (!person) throw new Error('Update returned no data')
    return {
      id: person.id,
      firstName: person.name?.firstName || '',
      lastName: person.name?.lastName || '',
      email: person.emails?.primaryEmail || '',
      company: person.company?.name,
      phone: person.phones?.primaryPhone,
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    const mutation = `
      mutation DeletePerson($id: ID!) {
        deletePerson(id: $id) { success }
      }
    `
    const res = await fetch(`${this.baseUrl}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ query: mutation, variables: { id } }),
    })
    if (!res.ok) return false
    const result = await res.json()
    return result.data?.deletePerson?.success === true
  }

  // Opportunities (stub implementations for Twenty CRM)
  async queryOpportunities(filter?: string, limit?: number): Promise<CRMOpportunity[]> {
    console.warn('[TwentyCRM] Opportunities not yet implemented')
    return []
  }

  async getOpportunity(id: string): Promise<CRMOpportunity | null> {
    console.warn('[TwentyCRM] Opportunities not yet implemented')
    return null
  }

  async createOpportunity(data: CRMOpportunityMutation): Promise<CRMOpportunity> {
    throw new Error('[TwentyCRM] createOpportunity not implemented')
  }

  async updateOpportunity(id: string, data: CRMOpportunityMutation): Promise<CRMOpportunity> {
    throw new Error('[TwentyCRM] updateOpportunity not implemented')
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    throw new Error('[TwentyCRM] deleteOpportunity not implemented')
  }
}

export class PerissosCRMAdapter implements CRMAdapter {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.PERISSOS_CRM_API_URL || 'http://localhost:3002'
    this.apiKey = process.env.PERISSOS_CRM_API_KEY || ''
  }

  private async graphql(query: string, variables?: Record<string, any>): Promise<any> {
    const res = await fetch(`${this.baseUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    })
    if (!res.ok) throw new Error(`Perissos CRM API error: ${res.status}`)
    const data = await res.json()
    if (data.errors) throw new Error(data.errors[0]?.message || 'GraphQL error')
    return data.data
  }

  async queryContacts(filter?: string, limit?: number): Promise<CRMContact[]> {
    const query = `
      query GetPeople($filter: PersonFilterInput, $limit: Int) {
        people(filter: $filter, limit: $limit) {
          edges {
            node {
              id
              name { firstName lastName }
              emails { primaryEmail }
              phones { primaryPhone }
              company { name }
            }
          }
        }
      }
    `
    const variables: Record<string, any> = {}
    if (limit) variables.limit = limit
    if (filter) {
      variables.filter = {
        or: [
          { name: { firstName: { like: `%${filter}%` } } },
          { name: { lastName: { like: `%${filter}%` } } },
          { emails: { primaryEmail: { like: `%${filter}%` } } },
        ],
      }
    }

    const data = await this.graphql(query, variables)
    return (data?.people?.edges || []).map((edge: any) => ({
      id: edge.node.id,
      firstName: edge.node.name?.firstName || '',
      lastName: edge.node.name?.lastName || '',
      email: edge.node.emails?.primaryEmail || '',
      company: edge.node.company?.name,
      phone: edge.node.phones?.primaryPhone,
    }))
  }

  async getContact(id: string): Promise<CRMContact | null> {
    const query = `
      query GetPerson($id: ID!) {
        person(filter: { id: { eq: $id } }) {
          id
          name { firstName lastName }
          emails { primaryEmail }
          phones { primaryPhone }
          company { name }
        }
      }
    `
    const data = await this.graphql(query, { id })
    const person = data?.person
    if (!person) return null
    return {
      id: person.id,
      firstName: person.name?.firstName || '',
      lastName: person.name?.lastName || '',
      email: person.emails?.primaryEmail || '',
      company: person.company?.name,
      phone: person.phones?.primaryPhone,
    }
  }

  async createContact(data: CRMContactMutation): Promise<CRMContact> {
    const mutation = `
      mutation CreatePerson($input: PersonCreateInput!) {
        createPerson(data: $input) {
          id
          name { firstName lastName }
          emails { primaryEmail }
          phones { primaryPhone }
          company { name }
        }
      }
    `
    const result = await this.graphql(mutation, {
      input: {
        name: { firstName: data.firstName || '', lastName: data.lastName || '' },
        emails: { primaryEmail: data.email || '' },
        phones: { primaryPhone: data.phone || '' },
      },
    })
    const person = result?.createPerson
    if (!person) throw new Error('Create returned no data')
    return {
      id: person.id,
      firstName: person.name?.firstName || '',
      lastName: person.name?.lastName || '',
      email: person.emails?.primaryEmail || '',
      company: person.company?.name,
      phone: person.phones?.primaryPhone,
    }
  }

  async updateContact(id: string, data: CRMContactMutation): Promise<CRMContact> {
    const mutation = `
      mutation UpdatePerson($id: ID!, $input: PersonUpdateInput!) {
        updatePerson(id: $id, data: $input) {
          id
          name { firstName lastName }
          emails { primaryEmail }
          phones { primaryPhone }
          company { name }
        }
      }
    `
    const input: Record<string, any> = {}
    if (data.firstName || data.lastName) input.name = { firstName: data.firstName, lastName: data.lastName }
    if (data.email) input.emails = { primaryEmail: data.email }
    if (data.phone) input.phones = { primaryPhone: data.phone }

    const result = await this.graphql(mutation, { id, input })
    const person = result?.updatePerson
    if (!person) throw new Error('Update returned no data')
    return {
      id: person.id,
      firstName: person.name?.firstName || '',
      lastName: person.name?.lastName || '',
      email: person.emails?.primaryEmail || '',
      company: person.company?.name,
      phone: person.phones?.primaryPhone,
    }
  }

  async deleteContact(id: string): Promise<boolean> {
    const mutation = `
      mutation DeletePerson($id: ID!) {
        deletePerson(id: $id) { success }
      }
    `
    const result = await this.graphql(mutation, { id })
    return result?.deletePerson?.success === true
  }

  // Opportunities
  async queryOpportunities(filter?: string, limit?: number): Promise<CRMOpportunity[]> {
    try {
      const query = `
        query GetOpportunities($filter: OpportunityFilterInput, $limit: Int) {
          opportunities(filter: $filter, limit: $limit) {
            edges {
              node {
                id
                name
                amount
                currency
                stage
                description
                expectedCloseDate
                person { id name { firstName lastName } emails { primaryEmail } }
              }
            }
          }
        }
      `
      const variables: Record<string, any> = {}
      if (limit) variables.limit = limit
      if (filter) {
        variables.filter = { or: [{ name: { like: `%${filter}%` } }] }
      }
      const data = await this.graphql(query, variables)
      return (data?.opportunities?.edges || []).map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        contactId: edge.node.person?.id || '',
        amount: Number(edge.node.amount),
        currency: edge.node.currency || 'EUR',
        stage: edge.node.stage,
        description: edge.node.description,
        expectedCloseDate: edge.node.expectedCloseDate,
        contactName: edge.node.person?.name ? `${edge.node.person.name.firstName} ${edge.node.person.name.lastName}` : undefined,
        contactEmail: edge.node.person?.emails?.primaryEmail,
        createdAt: edge.node.createdAt,
        updatedAt: edge.node.updatedAt,
      }))
    } catch (err) {
      console.error('[PerissosCRM] Query opportunities failed:', err)
      return []
    }
  }

  async getOpportunity(id: string): Promise<CRMOpportunity | null> {
    try {
      const query = `
        query GetOpportunity($id: ID!) {
          opportunity(filter: { id: { eq: $id } }) {
            id
            name
            amount
            currency
            stage
            description
            expectedCloseDate
            person { id name { firstName lastName } emails { primaryEmail } }
          }
        }
      `
      const data = await this.graphql(query, { id })
      const opp = data?.opportunity
      if (!opp) return null
      return {
        id: opp.id,
        name: opp.name,
        contactId: opp.person?.id || '',
        amount: Number(opp.amount),
        currency: opp.currency || 'EUR',
        stage: opp.stage,
        description: opp.description,
        expectedCloseDate: opp.expectedCloseDate,
        contactName: opp.person?.name ? `${opp.person.name.firstName} ${opp.person.name.lastName}` : undefined,
        contactEmail: opp.person?.emails?.primaryEmail,
        createdAt: opp.createdAt,
        updatedAt: opp.updatedAt,
      }
    } catch {
      return null
    }
  }

  async createOpportunity(data: CRMOpportunityMutation): Promise<CRMOpportunity> {
    const mutation = `
      mutation CreateOpportunity($input: OpportunityCreateInput!) {
        createOpportunity(data: $input) {
          id
          name
          amount
          currency
          stage
          description
          expectedCloseDate
          person { id name { firstName lastName } emails { primaryEmail } }
        }
      }
    `
    const result = await this.graphql(mutation, {
      input: {
        name: data.name,
        amount: data.amount,
        currency: data.currency || 'EUR',
        stage: data.stage || 'lead',
        description: data.description,
        expectedCloseDate: data.expectedCloseDate,
        personId: data.contactId,
      },
    })
    const opp = result?.createOpportunity
    if (!opp) throw new Error('Create opportunity returned no data')
    return {
      id: opp.id,
      name: opp.name,
      contactId: data.contactId,
      amount: Number(opp.amount),
      currency: opp.currency || 'EUR',
      stage: opp.stage,
      description: opp.description,
      expectedCloseDate: opp.expectedCloseDate,
      createdAt: new Date().toISOString(),
    }
  }

  async updateOpportunity(id: string, data: CRMOpportunityMutation): Promise<CRMOpportunity> {
    const mutation = `
      mutation UpdateOpportunity($id: ID!, $input: OpportunityUpdateInput!) {
        updateOpportunity(id: $id, data: $input) {
          id
          name
          amount
          currency
          stage
          description
          expectedCloseDate
          person { id name { firstName lastName } emails { primaryEmail } }
        }
      }
    `
    const input: Record<string, any> = {}
    if (data.name) input.name = data.name
    if (data.amount) input.amount = data.amount
    if (data.currency) input.currency = data.currency
    if (data.stage) input.stage = data.stage
    if (data.description) input.description = data.description
    if (data.expectedCloseDate) input.expectedCloseDate = data.expectedCloseDate

    const result = await this.graphql(mutation, { id, input })
    const opp = result?.updateOpportunity
    if (!opp) throw new Error('Update opportunity returned no data')
    return {
      id: opp.id,
      name: opp.name,
      contactId: data.contactId,
      amount: Number(opp.amount),
      currency: opp.currency || 'EUR',
      stage: opp.stage,
      description: opp.description,
      expectedCloseDate: opp.expectedCloseDate,
      createdAt: opp.createdAt,
      updatedAt: new Date().toISOString(),
    }
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteOpportunity($id: ID!) {
        deleteOpportunity(id: $id) { success }
      }
    `
    const result = await this.graphql(mutation, { id })
    return result?.deleteOpportunity?.success === true
  }
}

export function getCRMAdapter(): CRMAdapter {
  const provider = process.env.CRM_PROVIDER || 'mock'
  if (provider === 'perissos-crm') return new PerissosCRMAdapter()
  if (provider === 'twenty') return new TwentyCRMAdapter()
  return new MockCRMAdapter()
}
