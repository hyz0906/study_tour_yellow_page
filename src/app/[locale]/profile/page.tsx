'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { updateProfile } from '@/lib/auth'
import { getFollowStats, type FollowStats } from '@/lib/social'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'react-hot-toast'

const profileSchema = z.object({
  nickname: z.string().min(2, 'Nickname must be at least 2 characters').max(50, 'Nickname must be less than 50 characters'),
  bio: z.string().max(200, 'Bio must be less than 200 characters').optional(),
  interests: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<FollowStats | null>(null)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    if (user) {
      setValue('nickname', user.nickname || '')
      setValue('bio', user.bio || '')
      setValue('interests', user.interests?.join(', ') || '')
      loadStats()
    }
  }, [user, isAuthenticated, router, setValue])

  const loadStats = async () => {
    if (!user) return

    try {
      const data = await getFollowStats(user.id)
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setLoading(true)
    try {
      const interests = data.interests
        ? data.interests.split(',').map(item => item.trim()).filter(Boolean)
        : []

      await updateProfile({
        nickname: data.nickname,
        bio: data.bio || null,
        interests,
      })

      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your personal information and preferences.
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    {user.avatar_url ? (
                      <img
                        className="w-16 h-16 rounded-full"
                        src={user.avatar_url}
                        alt={user.nickname || 'Profile'}
                      />
                    ) : (
                      <UserCircleIcon className="w-16 h-16 text-gray-400" />
                    )}
                    <Button variant="outline" size="sm">
                      <CameraIcon className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </div>

                <Input
                  {...register('nickname')}
                  label="Nickname"
                  error={errors.nickname?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      errors.bio
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                </div>

                <Input
                  {...register('interests')}
                  label="Interests"
                  placeholder="e.g., Study abroad, Language learning, Adventure travel"
                  error={errors.interests?.message}
                />

                <div className="pt-4 border-t border-gray-200">
                  <Button type="submit" loading={loading}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>

            {/* Stats Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Account Overview
                </h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Role:</span>
                    <p className="font-medium text-gray-900 capitalize">{user.role}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Member since:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {stats && (
                    <>
                      <div>
                        <span className="text-sm text-gray-600">Followers:</span>
                        <p className="font-medium text-gray-900">{stats.followersCount}</p>
                      </div>

                      <div>
                        <span className="text-sm text-gray-600">Following:</span>
                        <p className="font-medium text-gray-900">{stats.followingCount}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}