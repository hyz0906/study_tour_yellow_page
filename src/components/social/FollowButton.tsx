'use client'

import { useState, useEffect } from 'react'
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline'
import { followUser, unfollowUser, getFollowStats, type FollowStats } from '@/lib/social'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

interface FollowButtonProps {
  userId: string
  showStats?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'outline'
}

export function FollowButton({
  userId,
  showStats = false,
  size = 'md',
  variant = 'primary'
}: FollowButtonProps) {
  const [stats, setStats] = useState<FollowStats | null>(null)
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (userId) {
      loadStats()
    }
  }, [userId, user?.id])

  const loadStats = async () => {
    try {
      const data = await getFollowStats(userId, user?.id)
      setStats(data)
    } catch (error) {
      console.error('Error loading follow stats:', error)
    }
  }

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow users')
      return
    }

    if (!user || user.id === userId) {
      return
    }

    setLoading(true)
    try {
      if (stats?.isFollowing) {
        await unfollowUser(userId)
        toast.success('Unfollowed successfully')
      } else {
        await followUser(userId)
        toast.success('Following successfully')
      }

      await loadStats()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update follow status')
    } finally {
      setLoading(false)
    }
  }

  if (!stats || !user || user.id === userId) {
    return null
  }

  return (
    <div className="flex items-center space-x-4">
      <Button
        onClick={handleFollow}
        loading={loading}
        size={size}
        variant={stats.isFollowing ? 'outline' : variant}
        className="flex items-center"
      >
        {stats.isFollowing ? (
          <>
            <UserMinusIcon className="h-4 w-4 mr-2" />
            Unfollow
          </>
        ) : (
          <>
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Follow
          </>
        )}
      </Button>

      {showStats && (
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>
            <span className="font-semibold">{stats.followersCount}</span> followers
          </span>
          <span>
            <span className="font-semibold">{stats.followingCount}</span> following
          </span>
        </div>
      )}
    </div>
  )
}