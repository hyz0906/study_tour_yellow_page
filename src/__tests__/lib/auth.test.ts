import { signUp, signIn, signOut, getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// Mock the supabase module
jest.mock('@/lib/supabase')

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Auth Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signUp', () => {
    it('should sign up a new user successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: mockUser, session: null },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          error: null,
        }),
      } as any)

      const result = await signUp('test@example.com', 'password', 'Test User')

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })

      expect(result.user).toEqual(mockUser)
    })

    it('should throw error when sign up fails', async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Email already exists' },
      } as any)

      await expect(signUp('test@example.com', 'password')).rejects.toThrow(
        'Email already exists'
      )
    })
  })

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockSession = { user: { id: '123' } }
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: mockSession,
        error: null,
      } as any)

      const result = await signIn('test@example.com', 'password')

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })

      expect(result).toEqual(mockSession)
    })

    it('should throw error when sign in fails', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      } as any)

      await expect(signIn('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      )
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null })

      await expect(signOut()).resolves.not.toThrow()

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should throw error when sign out fails', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({
        error: { message: 'Sign out failed' },
      } as any)

      await expect(signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user with profile', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        nickname: 'testuser',
        role: 'user',
      }

      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      } as any)

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      } as any)

      const result = await getCurrentUser()

      expect(result).toEqual(mockProfile)
    })

    it('should return null when no user is logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      } as any)

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })

    it('should throw error when getUser fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Auth error' },
      } as any)

      await expect(getCurrentUser()).rejects.toThrow('Auth error')
    })
  })
})