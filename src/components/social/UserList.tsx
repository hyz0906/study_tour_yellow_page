'use client'

import Link from 'next/link'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { FollowButton } from './FollowButton'
import type { UserProfile } from '@/lib/social'

interface UserListProps {
  users: UserProfile[]
  loading?: boolean
  showFollowButton?: boolean
  emptyMessage?: string
}

export function UserList({
  users,
  loading = false,
  showFollowButton = true,
  emptyMessage = 'No users found'
}: UserListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24" />
                <div className="h-3 bg-gray-300 rounded w-32" />
              </div>
            </div>
            <div className="w-20 h-8 bg-gray-300 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <Link href={`/users/${user.id}`}>
              {user.avatar_url ? (
                <img
                  className="w-12 h-12 rounded-full"
                  src={user.avatar_url}
                  alt={user.nickname || 'User'}
                />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-gray-400" />
              )}
            </Link>

            <div>
              <Link
                href={`/users/${user.id}`}
                className="text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                {user.nickname || 'Anonymous User'}
              </Link>
              {user.bio && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          {showFollowButton && (
            <FollowButton userId={user.id} size="sm" />
          )}
        </div>
      ))}
    </div>
  )
}