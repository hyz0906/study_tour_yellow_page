'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/Button'
import { updateCommentStatus } from '@/lib/admin'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

interface Comment {
  id: string
  content: string
  status: 'published' | 'pending' | 'hidden' | 'deleted'
  created_at: string
  users?: {
    nickname?: string
    email?: string
  }
  campsites?: {
    name: string
  }
}

export default function CommentsManagement() {
  const { t } = useTranslation()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    loadComments()
  }, [filter])

  const loadComments = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch from API
      // For now, using mock data
      const mockComments: Comment[] = [
        {
          id: '1',
          content: 'This is a great camp! My child loved it.',
          status: 'pending' as const,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          users: { nickname: 'Parent123', email: 'parent@example.com' },
          campsites: { name: 'Summer Adventure Camp' }
        },
        {
          id: '2',
          content: 'Amazing experience! Highly recommend.',
          status: 'published' as const,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          users: { nickname: 'StudentUser', email: 'student@example.com' },
          campsites: { name: 'International Study Tour' }
        }
      ]

      // Filter comments based on status
      const filtered = filter === 'all'
        ? mockComments
        : mockComments.filter(c => c.status === filter)

      setComments(filtered)
    } catch (error) {
      toast.error(t('admin.comments.moderateError'))
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentAction = async (
    commentId: string,
    action: 'published' | 'pending' | 'hidden' | 'deleted'
  ) => {
    setProcessing(commentId)
    try {
      await updateCommentStatus(commentId, action)
      toast.success(t('admin.comments.moderateSuccess'))
      await loadComments()
    } catch (error) {
      toast.error(t('admin.comments.moderateError'))
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      hidden: 'bg-gray-100 text-gray-800',
      deleted: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.comments.title')}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {t('admin.comments.subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="pending">{t('common.pending')}</option>
              <option value="published">{t('common.published')}</option>
              <option value="hidden">{t('common.hidden')}</option>
              <option value="deleted">Deleted</option>
              <option value="all">All Comments</option>
            </select>
          </div>
        </div>

        {/* Comments List */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No comments found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {comments.map((comment) => (
                <div key={comment.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(comment.status)}`}
                        >
                          {t(`common.${comment.status}`)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-900 mb-2">{comment.content}</p>
                        <div className="text-sm text-gray-500">
                          <span>By: {comment.users?.nickname || t('common.anonymous')}</span>
                          {comment.campsites && (
                            <>
                              <span className="mx-2">•</span>
                              <span>On: {comment.campsites.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {comment.status !== 'published' && (
                        <Button
                          size="sm"
                          onClick={() => handleCommentAction(comment.id, 'published')}
                          loading={processing === comment.id}
                        >
                          {t('common.publish')}
                        </Button>
                      )}

                      {comment.status !== 'hidden' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCommentAction(comment.id, 'hidden')}
                          loading={processing === comment.id}
                        >
                          {t('common.hide')}
                        </Button>
                      )}

                      {comment.status !== 'deleted' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleCommentAction(comment.id, 'deleted')}
                          loading={processing === comment.id}
                        >
                          {t('common.delete')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}