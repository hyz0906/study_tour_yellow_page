import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

jest.mock('@/lib/supabase')

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loading state initially', () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any)

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any)

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should return user data when authenticated', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      nickname: 'testuser',
      role: 'user',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    } as any)

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockUser,
        error: null,
      }),
    }

    mockSupabase.from.mockReturnValue(mockQuery as any)

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isOrganizer).toBe(false)
  })

  it('should return admin flags correctly for admin user', async () => {
    const mockAdminUser = {
      id: '123',
      email: 'admin@example.com',
      role: 'admin',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: '123', email: 'admin@example.com' } },
      error: null,
    } as any)

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockAdminUser,
        error: null,
      }),
    }

    mockSupabase.from.mockReturnValue(mockQuery as any)

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isOrganizer).toBe(true)
  })

  it('should return organizer flag for organizer user', async () => {
    const mockOrganizerUser = {
      id: '123',
      email: 'org@example.com',
      role: 'organizer',
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: '123', email: 'org@example.com' } },
      error: null,
    } as any)

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockOrganizerUser,
        error: null,
      }),
    }

    mockSupabase.from.mockReturnValue(mockQuery as any)

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isOrganizer).toBe(true)
  })

  it('should handle auth state changes', async () => {
    let authStateCallback: ((event: string, session: any) => void) | null = null

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any)

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback
      return {
        data: { subscription: { unsubscribe: jest.fn() } },
      } as any
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()

    // Simulate user login
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      nickname: 'testuser',
      role: 'user',
    }

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockUser,
        error: null,
      }),
    }

    mockSupabase.from.mockReturnValue(mockQuery as any)

    if (authStateCallback) {
      authStateCallback('SIGNED_IN', {
        user: { id: '123', email: 'test@example.com' },
      })
    }

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  it('should cleanup subscription on unmount', () => {
    const unsubscribe = jest.fn()

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any)

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    } as any)

    const { unmount } = renderHook(() => useAuth())

    unmount()

    expect(unsubscribe).toHaveBeenCalled()
  })
})