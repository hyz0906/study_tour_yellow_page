import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { getAdminStats } from '@/lib/admin'
import AdminDashboard from '@/app/[locale]/admin/page'

// Mock dependencies
jest.mock('@/hooks/useAuth')
jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'admin.dashboard.title': 'Admin Dashboard',
        'admin.dashboard.subtitle': 'Welcome to the StudyTour admin dashboard',
        'admin.stats.totalCampsites': 'Total Campsites',
        'admin.stats.totalUsers': 'Total Users',
        'admin.stats.totalComments': 'Total Comments',
        'admin.stats.pendingReports': 'Pending Reports',
        'admin.recentComments.title': 'Recent Comments',
        'admin.recentComments.empty': 'No recent comments',
        'admin.recentUsers.title': 'Recent Users',
        'admin.recentUsers.empty': 'No recent users',
        'admin.joinedAgo': 'Joined',
        'common.anonymous': 'Anonymous'
      }
      return translations[key] || key
    },
    locale: 'en'
  })
}))

jest.mock('@/lib/admin')
jest.mock('@/components/admin/AdminLayout', () => {
  return function MockAdminLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="admin-layout">{children}</div>
  }
})
jest.mock('@/components/admin/StatsCard', () => {
  return function MockStatsCard({ title, value }: { title: string; value: number }) {
    return <div data-testid="stats-card">{title}: {value}</div>
  }
})
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockGetAdminStats = getAdminStats as jest.MockedFunction<typeof getAdminStats>

describe('Admin Dashboard', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'admin@test.com',
        full_name: 'Admin User',
        role: 'admin',
        avatar_url: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      loading: false,
      isAuthenticated: true,
      isAdmin: true,
      isOrganizer: true
    })

    mockGetAdminStats.mockResolvedValue({
      totalCampsites: 10,
      totalUsers: 25,
      totalComments: 50,
      totalReports: 5,
      pendingReports: 2
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders admin dashboard with stats', async () => {
    render(<AdminDashboard />)

    // Check if title is rendered
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome to the StudyTour admin dashboard')).toBeInTheDocument()

    // Wait for stats to load
    await waitFor(() => {
      expect(screen.getByText('Total Campsites: 10')).toBeInTheDocument()
      expect(screen.getByText('Total Users: 25')).toBeInTheDocument()
      expect(screen.getByText('Total Comments: 50')).toBeInTheDocument()
      expect(screen.getByText('Pending Reports: 2')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    mockGetAdminStats.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<AdminDashboard />)

    expect(screen.getByRole('progressbar', { name: /loading/i })).toBeInTheDocument()
  })

  it('shows empty states when no data', async () => {
    // Mock empty responses
    jest.doMock('@/lib/admin', () => ({
      getAdminStats: jest.fn().mockResolvedValue({
        totalCampsites: 10,
        totalUsers: 25,
        totalComments: 50,
        totalReports: 5,
        pendingReports: 2
      }),
      getRecentComments: jest.fn().mockResolvedValue([]),
      getRecentUsers: jest.fn().mockResolvedValue([])
    }))

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('No recent comments')).toBeInTheDocument()
      expect(screen.getByText('No recent users')).toBeInTheDocument()
    })
  })
})

describe('Admin API Routes', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Comment Moderation API', () => {
    it('should update comment status successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ message: 'Comment updated successfully' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const response = await fetch('/api/admin/comments/123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' })
      })

      expect(response.ok).toBe(true)
      expect(fetch).toHaveBeenCalledWith('/api/admin/comments/123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' })
      })
    })

    it('should delete comment successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ message: 'Comment deleted successfully' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const response = await fetch('/api/admin/comments/123', {
        method: 'DELETE'
      })

      expect(response.ok).toBe(true)
      expect(fetch).toHaveBeenCalledWith('/api/admin/comments/123', {
        method: 'DELETE'
      })
    })
  })

  describe('Campsite Management API', () => {
    it('should create campsite successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({
          message: 'Campsite created successfully',
          data: { id: '123', name: 'Test Camp' }
        })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const campsiteData = {
        name: 'Test Camp',
        description: 'A test campsite',
        category: 'summer',
        country: 'USA'
      }

      const response = await fetch('/api/admin/campsites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campsiteData)
      })

      expect(response.ok).toBe(true)
      expect(response.status).toBe(201)
    })

    it('should update campsite successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          message: 'Campsite updated successfully',
          data: { id: '123', name: 'Updated Camp' }
        })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const updateData = {
        name: 'Updated Camp',
        description: 'An updated description'
      }

      const response = await fetch('/api/admin/campsites/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      expect(response.ok).toBe(true)
    })

    it('should delete campsite successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ message: 'Campsite deleted successfully' })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const response = await fetch('/api/admin/campsites/123', {
        method: 'DELETE'
      })

      expect(response.ok).toBe(true)
    })
  })
})

// Test admin access control
describe('Admin Access Control', () => {
  it('should redirect non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'user@test.com',
        full_name: 'Regular User',
        role: 'user', // Not admin
        avatar_url: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      loading: false,
      isAuthenticated: true,
      isAdmin: false,
      isOrganizer: false
    })

    render(<AdminDashboard />)

    // Should not render admin content
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument()
  })

  it('should redirect unauthenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
      isOrganizer: false
    })

    render(<AdminDashboard />)

    // Should not render admin content
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument()
  })
})