// Mock Supabase client for testing without real database
import { User, Session } from '@supabase/supabase-js'

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    user_metadata: {
      full_name: 'John Doe',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
]

const mockCampsites = [
  {
    id: '1',
    name: 'Amazing Summer Camp UK',
    description: 'A wonderful summer camp experience in the beautiful countryside of England.',
    country: 'UK',
    category: 'summer',
    url: 'https://example.com/camp1',
    thumbnail_url: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400',
    source: 'manual',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Study Tour France',
    description: 'Educational tour through the historic cities of France.',
    country: 'France',
    category: 'study',
    url: 'https://example.com/camp2',
    thumbnail_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400',
    source: 'crawler',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Winter Sports Camp Switzerland',
    description: 'Learn skiing and snowboarding in the Swiss Alps.',
    country: 'Switzerland',
    category: 'winter',
    url: 'https://example.com/camp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1551524164-6cf906fa4d3e?w=400',
    source: 'manual',
    created_at: '2023-01-03T00:00:00Z',
    updated_at: '2023-01-03T00:00:00Z'
  }
]

const mockComments = [
  {
    id: '1',
    content: 'Had an amazing experience at this camp! Highly recommended.',
    campsite_id: '1',
    user_id: '1',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-01-15T00:00:00Z',
    likes: 5,
    dislikes: 0
  }
]

const mockRatings = [
  {
    id: '1',
    campsite_id: '1',
    user_id: '1',
    quality_rating: 5,
    safety_rating: 4,
    facilities_rating: 4,
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-01-15T00:00:00Z'
  }
]

// Mock session
let currentSession: Session | null = null
let currentUser: User | null = null

// Mock authentication methods
const mockAuth = {
  signUp: async ({ email, password }: { email: string; password: string }) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Date.now().toString(),
      email,
      user_metadata: {
        full_name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockUsers.push(newUser)
    currentUser = newUser
    currentSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: newUser
    }

    return { data: { user: newUser, session: currentSession }, error: null }
  },

  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } }
    }

    currentUser = user
    currentSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user
    }

    return { data: { user, session: currentSession }, error: null }
  },

  signInWithOAuth: async ({ provider }: { provider: string }) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { data: { url: 'mock-oauth-url' }, error: null }
  },

  signOut: async () => {
    currentUser = null
    currentSession = null
    return { error: null }
  },

  getSession: async () => {
    return { data: { session: currentSession }, error: null }
  },

  getUser: async () => {
    return { data: { user: currentUser }, error: null }
  },

  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    // Mock auth state change listener
    // Simulate initial auth state
    setTimeout(() => {
      callback('SIGNED_IN', currentSession)
    }, 100)

    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  }
}

// Mock database query builder
class MockQueryBuilder {
  private table: string
  private filters: any[] = []
  private selectFields = '*'
  private orderBy: any = null
  private limitCount: number | null = null
  private rangeStart: number | null = null
  private rangeEnd: number | null = null

  constructor(table: string) {
    this.table = table
  }

  select(fields = '*') {
    this.selectFields = fields
    return this
  }

  eq(field: string, value: any) {
    this.filters.push({ field, operator: 'eq', value })
    return this
  }

  neq(field: string, value: any) {
    this.filters.push({ field, operator: 'neq', value })
    return this
  }

  gt(field: string, value: any) {
    this.filters.push({ field, operator: 'gt', value })
    return this
  }

  gte(field: string, value: any) {
    this.filters.push({ field, operator: 'gte', value })
    return this
  }

  lt(field: string, value: any) {
    this.filters.push({ field, operator: 'lt', value })
    return this
  }

  lte(field: string, value: any) {
    this.filters.push({ field, operator: 'lte', value })
    return this
  }

  ilike(field: string, value: string) {
    this.filters.push({ field, operator: 'ilike', value })
    return this
  }

  in(field: string, values: any[]) {
    this.filters.push({ field, operator: 'in', values })
    return this
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderBy = { field, ascending: options?.ascending !== false }
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  range(start: number, end: number) {
    this.rangeStart = start
    this.rangeEnd = end
    return this
  }

  async then(resolve: any) {
    await new Promise(r => setTimeout(r, 100)) // Simulate network delay

    let data: any[] = []

    switch (this.table) {
      case 'campsites':
        data = [...mockCampsites]
        break
      case 'comments':
        data = [...mockComments]
        break
      case 'ratings':
        data = [...mockRatings]
        break
      case 'users':
        data = [...mockUsers]
        break
      default:
        data = []
    }

    // Apply filters
    data = data.filter(item => {
      return this.filters.every(filter => {
        const fieldValue = item[filter.field]
        switch (filter.operator) {
          case 'eq':
            return fieldValue === filter.value
          case 'neq':
            return fieldValue !== filter.value
          case 'gt':
            return fieldValue > filter.value
          case 'gte':
            return fieldValue >= filter.value
          case 'lt':
            return fieldValue < filter.value
          case 'lte':
            return fieldValue <= filter.value
          case 'ilike':
            return fieldValue?.toLowerCase().includes(filter.value.toLowerCase())
          case 'in':
            return filter.values.includes(fieldValue)
          default:
            return true
        }
      })
    })

    // Apply ordering
    if (this.orderBy) {
      data.sort((a, b) => {
        const aVal = a[this.orderBy.field]
        const bVal = b[this.orderBy.field]
        const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return this.orderBy.ascending ? result : -result
      })
    }

    // Apply range/limit
    if (this.rangeStart !== null && this.rangeEnd !== null) {
      data = data.slice(this.rangeStart, this.rangeEnd + 1)
    } else if (this.limitCount !== null) {
      data = data.slice(0, this.limitCount)
    }

    return resolve({ data, error: null, count: data.length })
  }

  // Insert mock
  async insert(values: any) {
    await new Promise(r => setTimeout(r, 100))

    const newItem = Array.isArray(values) ? values : [values]
    newItem.forEach(item => {
      item.id = Date.now().toString()
      item.created_at = new Date().toISOString()
      item.updated_at = new Date().toISOString()

      switch (this.table) {
        case 'campsites':
          mockCampsites.push(item)
          break
        case 'comments':
          mockComments.push(item)
          break
        case 'ratings':
          mockRatings.push(item)
          break
        case 'users':
          mockUsers.push(item)
          break
      }
    })

    return { data: newItem, error: null }
  }

  // Update mock
  async update(values: any) {
    await new Promise(r => setTimeout(r, 100))

    let data: any[]
    switch (this.table) {
      case 'campsites':
        data = mockCampsites
        break
      case 'comments':
        data = mockComments
        break
      case 'ratings':
        data = mockRatings
        break
      case 'users':
        data = mockUsers
        break
      default:
        data = []
    }

    // Apply filters to find items to update
    const itemsToUpdate = data.filter(item => {
      return this.filters.every(filter => {
        const fieldValue = item[filter.field]
        return fieldValue === filter.value
      })
    })

    itemsToUpdate.forEach(item => {
      Object.assign(item, values, { updated_at: new Date().toISOString() })
    })

    return { data: itemsToUpdate, error: null }
  }

  // Delete mock
  async delete() {
    await new Promise(r => setTimeout(r, 100))

    let data: any[]
    let targetArray: any[]

    switch (this.table) {
      case 'campsites':
        data = mockCampsites
        targetArray = mockCampsites
        break
      case 'comments':
        data = mockComments
        targetArray = mockComments
        break
      case 'ratings':
        data = mockRatings
        targetArray = mockRatings
        break
      case 'users':
        data = mockUsers
        targetArray = mockUsers
        break
      default:
        return { data: [], error: null }
    }

    // Find items to delete
    const itemsToDelete = data.filter(item => {
      return this.filters.every(filter => {
        const fieldValue = item[filter.field]
        return fieldValue === filter.value
      })
    })

    // Remove items from array
    itemsToDelete.forEach(item => {
      const index = targetArray.indexOf(item)
      if (index > -1) {
        targetArray.splice(index, 1)
      }
    })

    return { data: itemsToDelete, error: null }
  }
}

// Mock Supabase client
export const mockSupabase = {
  auth: mockAuth,
  from: (table: string) => new MockQueryBuilder(table),
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        await new Promise(r => setTimeout(r, 500))
        return {
          data: { path: `mock-storage/${bucket}/${path}` },
          error: null
        }
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://mock-storage.com/${path}` }
      })
    })
  }
}

export type MockSupabaseClient = typeof mockSupabase