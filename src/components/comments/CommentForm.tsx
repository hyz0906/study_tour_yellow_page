'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createComment } from '@/lib/comments'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

const commentSchema = z.object({
  content: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be less than 1000 characters'),
})

type CommentFormData = z.infer<typeof commentSchema>

interface CommentFormProps {
  campsiteId: string
  onCommentAdded: () => void
}

export function CommentForm({ campsiteId, onCommentAdded }: CommentFormProps) {
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  })

  const onSubmit = async (data: CommentFormData) => {
    if (!user) {
      toast.error('You must be signed in to comment')
      return
    }

    setLoading(true)
    try {
      await createComment({
        campsite_id: campsiteId,
        user_id: user.id,
        content: data.content,
      })

      toast.success('Comment added successfully!')
      reset()
      onCommentAdded()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">Sign in to leave a comment</p>
        <Button as="a" href="/auth" size="sm">
          Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add a Comment</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <textarea
            {...register('content')}
            rows={4}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              errors.content
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
            placeholder="Share your experience with this program..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Posting as <span className="font-medium">{user?.nickname || user?.email}</span>
          </p>
          <Button type="submit" loading={loading} disabled={loading}>
            Post Comment
          </Button>
        </div>
      </form>
    </div>
  )
}