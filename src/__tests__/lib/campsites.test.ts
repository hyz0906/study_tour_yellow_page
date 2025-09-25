import { getCampsites, getCampsiteById, createCampsite } from '@/lib/campsites'
import { supabase } from '@/lib/supabase'

jest.mock('@/lib/supabase')

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Campsites Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCampsites', () => {
    it('should return campsites with default parameters', async () => {
      const mockCampsites = [
        {
          id: '1',
          name: 'Test Camp',
          url: 'https://example.com',
          country: 'US',
          category: 'summer',
          avg_rating: 4.5,
        },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockCampsites,
          error: null,
          count: 1,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getCampsites()

      expect(mockSupabase.from).toHaveBeenCalledWith('campsites')
      expect(mockQuery.select).toHaveBeenCalledWith('*', { count: 'exact' })
      expect(result.data).toEqual(mockCampsites)
      expect(result.count).toBe(1)
    })

    it('should apply search filter', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      await getCampsites({ search: 'language camp' })

      expect(mockQuery.or).toHaveBeenCalledWith(
        'name.ilike.%language camp%,description.ilike.%language camp%'
      )
    })

    it('should apply country filter', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      await getCampsites({ country: 'UK' })

      expect(mockQuery.eq).toHaveBeenCalledWith('country', 'UK')
    })

    it('should handle errors', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
          count: 0,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      await expect(getCampsites()).rejects.toThrow('Database error')
    })
  })

  describe('getCampsiteById', () => {
    it('should return campsite by id', async () => {
      const mockCampsite = {
        id: '1',
        name: 'Test Camp',
        url: 'https://example.com',
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCampsite,
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getCampsiteById('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('campsites')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockCampsite)
    })

    it('should return null for non-existent campsite', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await getCampsiteById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('createCampsite', () => {
    it('should create a new campsite', async () => {
      const newCampsite = {
        name: 'New Camp',
        url: 'https://newcamp.com',
        country: 'US',
        category: 'summer' as const,
      }

      const createdCampsite = { id: '123', ...newCampsite }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: createdCampsite,
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await createCampsite(newCampsite)

      expect(mockSupabase.from).toHaveBeenCalledWith('campsites')
      expect(mockQuery.insert).toHaveBeenCalledWith(newCampsite)
      expect(result).toEqual(createdCampsite)
    })

    it('should handle creation errors', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Unique constraint violation' },
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const newCampsite = {
        name: 'Duplicate Camp',
        url: 'https://existing.com',
        category: 'summer' as const,
      }

      await expect(createCampsite(newCampsite)).rejects.toThrow(
        'Unique constraint violation'
      )
    })
  })
})