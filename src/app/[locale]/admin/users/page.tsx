'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/Button'
import { UserCircleIcon, ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

interface User {
  id: string
  email: string
  full_name?: string
  nickname?: string
  avatar_url?: string
  role: 'user' | 'organizer' | 'admin'
  created_at: string
  updated_at: string
}

export default function UsersManagement() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pageSize: 10,
  })

  useEffect(() => {
    loadUsers()
  }, [filter, pagination.page])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.pageSize.toString(),
        ...(filter !== 'all' && { role: filter })
      })

      // In a real app, this would call a real API
      // For now, using mock data
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@studytour.com',
          full_name: 'Admin User',
          nickname: 'admin',
          role: 'admin',
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        },
        {
          id: '2',
          email: 'organizer@studytour.com',
          full_name: 'Camp Organizer',
          nickname: 'organizer1',
          role: 'organizer',
          created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 15).toISOString(),
        },
        {
          id: '3',
          email: 'user@example.com',
          full_name: 'Regular User',
          nickname: 'user123',
          role: 'user',
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
        {
          id: '4',
          email: 'parent@example.com',
          full_name: 'Parent Smith',
          nickname: 'parent_smith',
          role: 'user',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        }
      ]

      // Filter users based on role if needed
      const filtered = filter === 'all'
        ? mockUsers
        : mockUsers.filter(u => u.role === filter)

      setUsers(filtered)
      setPagination(prev => ({ ...prev, total: filtered.length }))
    } catch (error) {
      toast.error('Failed to load users')
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'user' | 'organizer' | 'admin') => {
    setUpdating(userId)
    try {
      // In a real app, this would call the API
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        throw new Error('Failed to update user role')
      }

      toast.success('User role updated successfully')
      await loadUsers()
    } catch (error) {
      toast.error('Failed to update user role')
      console.error('Error updating user role:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheckIcon className="h-5 w-5 text-red-500" />
      case 'organizer':
        return <ShieldExclamationIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <UserCircleIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      organizer: 'bg-yellow-100 text-yellow-800',
      user: 'bg-gray-100 text-gray-800',
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage user accounts and permissions
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Users</option>
              <option value="admin">Admins</option>
              <option value="organizer">Organizers</option>
              <option value="user">Regular Users</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.avatar_url}
                                alt={user.full_name || user.email}
                              />
                            ) : (
                              <UserCircleIcon className="h-10 w-10 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || user.nickname || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(user.updated_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                            disabled={updating === user.id}
                            className="text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          >
                            <option value="user">User</option>
                            <option value="organizer">Organizer</option>
                            <option value="admin">Admin</option>
                          </select>
                          {updating === user.id && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {Math.ceil(pagination.total / pagination.pageSize) > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
            </p>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                {t('common.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}