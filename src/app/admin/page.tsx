'use client'

import { useState, useEffect } from 'react'
import {
  UserGroupIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { StatsCard } from '@/components/admin/StatsCard'
import { getAdminStats, getRecentComments, getRecentUsers, type AdminStats } from '@/lib/admin'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentComments, setRecentComments] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsData, commentsData, usersData] = await Promise.all([
        getAdminStats(),
        getRecentComments(5),
        getRecentUsers(5),
      ])

      setStats(statsData)
      setRecentComments(commentsData)
      setRecentUsers(usersData)
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome to the StudyTour admin dashboard
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Campsites"
              value={stats.totalCampsites}
              icon={GlobeAltIcon}
              color="blue"
            />
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={UserGroupIcon}
              color="green"
            />
            <StatsCard
              title="Total Comments"
              value={stats.totalComments}
              icon={ChatBubbleLeftRightIcon}
              color="purple"
            />
            <StatsCard
              title="Pending Reports"
              value={stats.pendingReports}
              icon={ExclamationTriangleIcon}
              color="red"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Comments */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Comments
              </h3>
              <div className="space-y-4">
                {recentComments.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent comments</p>
                ) : (
                  recentComments.map((comment: any) => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {comment.users?.nickname || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {comment.content}
                          </p>
                          <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                            <span>{comment.campsites?.name}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Users
              </h3>
              <div className="space-y-4">
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent users</p>
                ) : (
                  recentUsers.map((user: any) => (
                    <div key={user.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {user.nickname || user.email}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                            <span className="capitalize">{user.role}</span>
                            <span>•</span>
                            <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}