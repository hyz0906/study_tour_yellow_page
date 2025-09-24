'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { HandThumbUpIcon, HandThumbDownIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons/react/24/solid'
import { getCommentsByCampsite, likeComment, dislikeComment, type CommentWithUser } from '@/lib/comments'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

interface CommentListProps {
  campsiteId: string
  refreshTrigger: number
}

export function CommentList({ campsiteId, refreshTrigger }: CommentListProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const [dislikedComments, setDislikedComments] = useState<Set<string>>(new Set())
  const { isAuthenticated } = useAuth()

  const pageSize = 10

  useEffect(() => {
    loadComments()
  }, [campsiteId, refreshTrigger, page])

  const loadComments = async () => {
    setLoading(true)
    try {
      const response = await getCommentsByCampsite(campsiteId, page, pageSize)

      if (page === 1) {
        setComments(response.data)
      } else {
        setComments(prev => [...prev, ...response.data])
      }

      setTotalCount(response.count)
    } catch (error) {
      toast.error('Failed to load comments')
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!isAuthenticated) {
      toast.error('You must be signed in to like comments')
      return
    }

    try {
      await likeComment(commentId)
      setLikedComments(prev => new Set([...prev, commentId]))
      setDislikedComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })

      // Update local state
      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: (comment.likes || 0) + 1 }
          : comment
      ))

      toast.success('Comment liked!')
    } catch (error) {
      toast.error('Failed to like comment')
    }
  }

  const handleDislike = async (commentId: string) => {
    if (!isAuthenticated) {
      toast.error('You must be signed in to dislike comments')
      return
    }

    try {
      await dislikeComment(commentId)
      setDislikedComments(prev => new Set([...prev, commentId]))
      setLikedComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })

      // Update local state
      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? { ...comment, dislikes: (comment.dislikes || 0) + 1 }
          : comment
      ))

      toast.success('Comment disliked!')
    } catch (error) {
      toast.error('Failed to dislike comment')
    }
  }

  const loadMoreComments = () => {
    setPage(prev => prev + 1)
  }

  const hasMoreComments = comments.length < totalCount

  if (loading && page === 1) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4" />
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No comments yet.</p>
        <p className="text-sm text-gray-500">Be the first to share your experience!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Comments ({totalCount})
        </h3>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {comment.users?.avatar_url ? (
                  <img
                    className="w-10 h-10 rounded-full"
                    src={comment.users.avatar_url}
                    alt={comment.users.nickname || 'User'}
                  />
                ) : (
                  <UserCircleIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900">
                    {comment.users?.nickname || 'Anonymous User'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>

                <div className="prose prose-sm prose-gray max-w-none mb-4">
                  <p>{comment.content}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center space-x-1 text-sm ${
                      likedComments.has(comment.id)
                        ? 'text-green-600'
                        : 'text-gray-500 hover:text-green-600'
                    }`}
                    disabled={!isAuthenticated}
                  >
                    {likedComments.has(comment.id) ? (
                      <HandThumbUpSolidIcon className="w-4 h-4" />
                    ) : (
                      <HandThumbUpIcon className="w-4 h-4" />
                    )}
                    <span>{comment.likes || 0}</span>
                  </button>

                  <button
                    onClick={() => handleDislike(comment.id)}
                    className={`flex items-center space-x-1 text-sm ${
                      dislikedComments.has(comment.id)
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-red-600'
                    }`}
                    disabled={!isAuthenticated}
                  >
                    {dislikedComments.has(comment.id) ? (
                      <HandThumbDownSolidIcon className="w-4 h-4" />
                    ) : (
                      <HandThumbDownIcon className="w-4 h-4" />
                    )}
                    <span>{comment.dislikes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMoreComments && (
        <div className="text-center">
          <Button
            onClick={loadMoreComments}
            variant="outline"
            loading={loading}
          >
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  )
}