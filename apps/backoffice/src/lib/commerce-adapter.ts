export interface CommerceProduct {
  id: string
  title: string
  description?: string
  handle?: string
  variants: CommerceVariant[]
  prices: CommercePrice[]
  status: 'draft' | 'published'
  createdAt?: string
}

export interface CommerceVariant {
  id: string
  title: string
  sku?: string
  prices: CommercePrice[]
  inventory_quantity?: number
}

export interface CommercePrice {
  amount: number
  currency_code: string
}

export interface CommerceOrder {
  id: string
  display_id?: number
  email: string
  status: string
  fulfillment_status?: string
  payment_status?: string
  total: number
  currency_code: string
  items: CommerceOrderItem[]
  created_at?: string
}

export interface CommerceOrderItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  total: number
}

export interface CommerceCart {
  id: string
  email?: string
  items: CommerceCartItem[]
  total: number
  currency_code: string
}

export interface CommerceCartItem {
  id: string
  product_id: string
  title: string
  quantity: number
  unit_price: number
}

export interface CommerceQueryResult {
  products: CommerceProduct[]
  count: number
  source: 'mock' | 'medusa' | 'perissos-commerce'
  query?: string
}

export interface ProductMutation {
  title?: string
  description?: string
  handle?: string
  status?: 'draft' | 'published'
  variants?: Partial<CommerceVariant>[]
  prices?: CommercePrice[]
}

export interface CommerceActionResult {
  success: boolean
  product?: CommerceProduct
  order?: CommerceOrder
  cart?: CommerceCart
  error?: string
}

export interface CommerceAdapter {
  queryProducts(filter?: string, limit?: number): Promise<CommerceProduct[]>
  getProduct(id: string): Promise<CommerceProduct | null>
  createProduct(data: ProductMutation): Promise<CommerceProduct>
  updateProduct(id: string, data: ProductMutation): Promise<CommerceProduct>
  createOrder(cartId: string, email: string): Promise<CommerceOrder>
  getOrder(id: string): Promise<CommerceOrder | null>
  queryOrders(filter?: string, limit?: number): Promise<CommerceOrder[]>
  getCart(id: string): Promise<CommerceCart | null>
  createCart(): Promise<CommerceCart>
  addToCart(cartId: string, productId: string, quantity: number): Promise<CommerceCart>
}

const MOCK_PRODUCTS: CommerceProduct[] = [
  {
    id: 'prod_1',
    title: 'Organic Cold-Pressed Juice',
    description: 'Fresh cold-pressed juice made from organic fruits.',
    handle: 'organic-cold-pressed-juice',
    variants: [{ id: 'var_1', title: '500ml', sku: 'JUICE-500', prices: [{ amount: 890, currency_code: 'eur' }], inventory_quantity: 100 }],
    prices: [{ amount: 890, currency_code: 'eur' }],
    status: 'published',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'prod_2',
    title: 'Artisan Sourdough Bread',
    description: 'Traditional sourdough bread baked daily.',
    handle: 'artisan-sourdough-bread',
    variants: [{ id: 'var_2', title: 'Loaf', sku: 'BREAD-001', prices: [{ amount: 550, currency_code: 'eur' }], inventory_quantity: 50 }],
    prices: [{ amount: 550, currency_code: 'eur' }],
    status: 'published',
    createdAt: '2026-08-05T09:00:00Z',
  },
  {
    id: 'prod_3',
    title: 'Premium Olive Oil',
    description: 'Extra virgin olive oil from Provence.',
    handle: 'premium-olive-oil',
    variants: [{ id: 'var_3', title: '500ml', sku: 'OIL-500', prices: [{ amount: 1290, currency_code: 'eur' }], inventory_quantity: 75 }],
    prices: [{ amount: 1290, currency_code: 'eur' }],
    status: 'published',
    createdAt: '2026-08-10T11:00:00Z',
  },
  {
    id: 'prod_4',
    title: 'Gourmet Honey Jar',
    description: 'Raw wildflower honey from local apiaries.',
    handle: 'gourmet-honey-jar',
    variants: [{ id: 'var_4', title: '250g', sku: 'HONEY-250', prices: [{ amount: 990, currency_code: 'eur' }], inventory_quantity: 60 }],
    prices: [{ amount: 990, currency_code: 'eur' }],
    status: 'published',
    createdAt: '2026-08-12T14:00:00Z',
  },
  {
    id: 'prod_5',
    title: 'Fresh Pasta Bundle',
    description: 'Handmade fresh pasta, 3 varieties.',
    handle: 'fresh-pasta-bundle',
    variants: [{ id: 'var_5', title: 'Bundle', sku: 'PASTA-BUN', prices: [{ amount: 1490, currency_code: 'eur' }], inventory_quantity: 40 }],
    prices: [{ amount: 1490, currency_code: 'eur' }],
    status: 'draft',
    createdAt: '2026-08-15T16:00:00Z',
  },
]

let mockProducts = [...MOCK_PRODUCTS]
let mockOrders: CommerceOrder[] = []
let mockCarts: CommerceCart[] = []
let mockIdCounter = 100

export class MockCommerceAdapter implements CommerceAdapter {
  async queryProducts(filter?: string, limit?: number): Promise<CommerceProduct[]> {
    let results = [...mockProducts]
    if (filter) {
      const f = filter.toLowerCase()
      results = results.filter(p =>
        p.title.toLowerCase().includes(f) ||
        p.description?.toLowerCase().includes(f) ||
        p.handle?.toLowerCase().includes(f)
      )
    }
    if (limit && limit > 0) results = results.slice(0, limit)
    return results
  }

  async getProduct(id: string): Promise<CommerceProduct | null> {
    return mockProducts.find(p => p.id === id) || null
  }

  async createProduct(data: ProductMutation): Promise<CommerceProduct> {
    const product: CommerceProduct = {
      id: `prod_${++mockIdCounter}`,
      title: data.title || 'Untitled Product',
      description: data.description,
      handle: data.handle,
      variants: data.variants?.map((v, i) => ({
        id: `var_${mockIdCounter}_${i}`,
        title: v.title || 'Default',
        sku: v.sku,
        prices: v.prices || [{ amount: 0, currency_code: 'eur' }],
        inventory_quantity: v.inventory_quantity || 0,
      })) || [{ id: `var_${mockIdCounter}_0`, title: 'Default', prices: [{ amount: 0, currency_code: 'eur' }], inventory_quantity: 0 }],
      prices: data.prices || [{ amount: 0, currency_code: 'eur' }],
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
    }
    mockProducts.push(product)
    return product
  }

  async updateProduct(id: string, data: ProductMutation): Promise<CommerceProduct> {
    const idx = mockProducts.findIndex(p => p.id === id)
    if (idx === -1) throw new Error(`Product ${id} not found`)
    if (data.title) mockProducts[idx].title = data.title
    if (data.description !== undefined) mockProducts[idx].description = data.description
    if (data.status) mockProducts[idx].status = data.status
    return mockProducts[idx]
  }

  async createOrder(cartId: string, email: string): Promise<CommerceOrder> {
    const cart = mockCarts.find(c => c.id === cartId)
    if (!cart) throw new Error(`Cart ${cartId} not found`)
    const order: CommerceOrder = {
      id: `ord_${++mockIdCounter}`,
      display_id: mockOrders.length + 1,
      email,
      status: 'pending',
      fulfillment_status: 'not_fulfilled',
      payment_status: 'awaiting',
      total: cart.total,
      currency_code: cart.currency_code,
      items: cart.items.map(i => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: i.unit_price * i.quantity,
      })),
      created_at: new Date().toISOString(),
    }
    mockOrders.push(order)
    return order
  }

  async getOrder(id: string): Promise<CommerceOrder | null> {
    return mockOrders.find(o => o.id === id) || null
  }

  async queryOrders(filter?: string, limit?: number): Promise<CommerceOrder[]> {
    let results = [...mockOrders]
    if (filter) {
      const f = filter.toLowerCase()
      results = results.filter(o => o.email.toLowerCase().includes(f) || o.status.includes(f))
    }
    if (limit && limit > 0) results = results.slice(0, limit)
    return results
  }

  async getCart(id: string): Promise<CommerceCart | null> {
    return mockCarts.find(c => c.id === id) || null
  }

  async createCart(): Promise<CommerceCart> {
    const cart: CommerceCart = {
      id: `cart_${++mockIdCounter}`,
      items: [],
      total: 0,
      currency_code: 'eur',
    }
    mockCarts.push(cart)
    return cart
  }

  async addToCart(cartId: string, productId: string, quantity: number): Promise<CommerceCart> {
    const cart = mockCarts.find(c => c.id === cartId)
    if (!cart) throw new Error(`Cart ${cartId} not found`)
    const product = mockProducts.find(p => p.id === productId)
    if (!product) throw new Error(`Product ${productId} not found`)
    const unitPrice = product.prices[0]?.amount || 0
    const existing = cart.items.find(i => i.product_id === productId)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.items.push({
        id: `item_${++mockIdCounter}`,
        product_id: productId,
        title: product.title,
        quantity,
        unit_price: unitPrice,
      })
    }
    cart.total = cart.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
    return cart
  }
}

export class MedusaCommerceAdapter implements CommerceAdapter {
  private baseUrl: string
  private apiKey: string
  private publishableKey: string

  constructor() {
    this.baseUrl = process.env.MEDUSA_API_URL || 'http://localhost:3100'
    this.apiKey = process.env.MEDUSA_API_KEY || ''
    this.publishableKey = process.env.MEDUSA_PUBLISHABLE_KEY || ''
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`
    if (this.publishableKey) headers['x-publishable-api-key'] = this.publishableKey

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) throw new Error(`Medusa API error: ${res.status}`)
    return res.json()
  }

  async queryProducts(filter?: string, limit?: number): Promise<CommerceProduct[]> {
    const params = new URLSearchParams()
    if (filter) params.set('q', filter)
    if (limit) params.set('limit', String(limit))
    const data = await this.request('GET', `/store/products?${params}`)
    return (data.products || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      handle: p.handle,
      variants: (p.variants || []).map((v: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        prices: (v.prices || []).map((pr: any) => ({ amount: pr.amount, currency_code: pr.currency_code })),
        inventory_quantity: v.inventory_quantity,
      })),
      prices: (p.variants?.[0]?.prices || []).map((pr: any) => ({ amount: pr.amount, currency_code: pr.currency_code })),
      status: p.status,
      createdAt: p.created_at,
    }))
  }

  async getProduct(id: string): Promise<CommerceProduct | null> {
    try {
      const data = await this.request('GET', `/store/products/${id}`)
      const p = data.product
      if (!p) return null
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        handle: p.handle,
        variants: (p.variants || []).map((v: any) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          prices: (v.prices || []).map((pr: any) => ({ amount: pr.amount, currency_code: pr.currency_code })),
          inventory_quantity: v.inventory_quantity,
        })),
        prices: (p.variants?.[0]?.prices || []).map((pr: any) => ({ amount: pr.amount, currency_code: pr.currency_code })),
        status: p.status,
        createdAt: p.created_at,
      }
    } catch {
      return null
    }
  }

  async createProduct(data: ProductMutation): Promise<CommerceProduct> {
    const res = await this.request('POST', '/admin/products', {
      product: {
        title: data.title,
        description: data.description,
        status: data.status || 'draft',
      },
    })
    const p = res.product
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      handle: p.handle,
      variants: [],
      prices: [],
      status: p.status,
      createdAt: p.created_at,
    }
  }

  async updateProduct(id: string, data: ProductMutation): Promise<CommerceProduct> {
    const res = await this.request('POST', `/admin/products/${id}`, {
      product: {
        title: data.title,
        description: data.description,
        status: data.status,
      },
    })
    const p = res.product
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      handle: p.handle,
      variants: (p.variants || []).map((v: any) => ({
        id: v.id, title: v.title, sku: v.sku,
        prices: (v.prices || []).map((pr: any) => ({ amount: pr.amount, currency_code: pr.currency_code })),
        inventory_quantity: v.inventory_quantity,
      })),
      prices: (p.variants?.[0]?.prices || []).map((pr: any) => ({ amount: pr.amount, currency_code: pr.currency_code })),
      status: p.status,
      createdAt: p.created_at,
    }
  }

  async createOrder(cartId: string, email: string): Promise<CommerceOrder> {
    const res = await this.request('POST', `/store/carts/${cartId}`, { email })
    const cart = res.cart
    const orderRes = await this.request('POST', `/store/carts/${cart.id}/complete`)
    const o = orderRes.order
    return {
      id: o.id,
      display_id: o.display_id,
      email: o.email,
      status: o.status,
      fulfillment_status: o.fulfillment_status,
      payment_status: o.payment_status,
      total: o.total,
      currency_code: o.currency_code,
      items: (o.items || []).map((i: any) => ({
        id: i.id, title: i.title, quantity: i.quantity,
        unit_price: i.unit_price, total: i.total,
      })),
      created_at: o.created_at,
    }
  }

  async getOrder(id: string): Promise<CommerceOrder | null> {
    try {
      const data = await this.request('GET', `/store/orders/${id}`)
      const o = data.order
      if (!o) return null
      return {
        id: o.id, display_id: o.display_id, email: o.email,
        status: o.status, fulfillment_status: o.fulfillment_status,
        payment_status: o.payment_status, total: o.total,
        currency_code: o.currency_code,
        items: (o.items || []).map((i: any) => ({
          id: i.id, title: i.title, quantity: i.quantity,
          unit_price: i.unit_price, total: i.total,
        })),
        created_at: o.created_at,
      }
    } catch {
      return null
    }
  }

  async queryOrders(filter?: string, limit?: number): Promise<CommerceOrder[]> {
    const params = new URLSearchParams()
    if (filter) params.set('q', filter)
    if (limit) params.set('limit', String(limit))
    const data = await this.request('GET', `/admin/orders?${params}`)
    return (data.orders || []).map((o: any) => ({
      id: o.id, display_id: o.display_id, email: o.email,
      status: o.status, fulfillment_status: o.fulfillment_status,
      payment_status: o.payment_status, total: o.total,
      currency_code: o.currency_code,
      items: (o.items || []).map((i: any) => ({
        id: i.id, title: i.title, quantity: i.quantity,
        unit_price: i.unit_price, total: i.total,
      })),
      created_at: o.created_at,
    }))
  }

  async getCart(id: string): Promise<CommerceCart | null> {
    try {
      const data = await this.request('GET', `/store/carts/${id}`)
      const c = data.cart
      if (!c) return null
      return {
        id: c.id, email: c.email,
        items: (c.items || []).map((i: any) => ({
          id: i.id, product_id: i.product_id, title: i.title,
          quantity: i.quantity, unit_price: i.unit_price,
        })),
        total: c.total, currency_code: c.currency_code,
      }
    } catch {
      return null
    }
  }

  async createCart(): Promise<CommerceCart> {
    const data = await this.request('POST', '/store/carts', {})
    const c = data.cart
    return {
      id: c.id, email: c.email,
      items: [], total: c.total || 0, currency_code: c.currency_code || 'eur',
    }
  }

  async addToCart(cartId: string, productId: string, quantity: number): Promise<CommerceCart> {
    const data = await this.request('POST', `/store/carts/${cartId}/line-items`, {
      product_id: productId, quantity,
    })
    const c = data.cart
    return {
      id: c.id, email: c.email,
      items: (c.items || []).map((i: any) => ({
        id: i.id, product_id: i.product_id, title: i.title,
        quantity: i.quantity, unit_price: i.unit_price,
      })),
      total: c.total, currency_code: c.currency_code,
    }
  }
}

export function getCommerceAdapter(): CommerceAdapter {
  const provider = process.env.COMMERCE_PROVIDER || 'mock'
  if (provider === 'medusa') return new MedusaCommerceAdapter()
  return new MockCommerceAdapter()
}
