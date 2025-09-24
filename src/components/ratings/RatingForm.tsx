'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { createOrUpdateRating, getUserRatingForCampsite } from '@/lib/ratings'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

const ratingSchema = z.object({
  score_overall: z.number().min(1).max(5),
  score_quality: z.number().min(1).max(5).optional(),
  score_facility: z.number().min(1).max(5).optional(),
  score_safety: z.number().min(1).max(5).optional(),
})

type RatingFormData = z.infer<typeof ratingSchema>

interface RatingFormProps {
  campsiteId: string
  onRatingSubmitted: () => void
}

interface StarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
  label: string
  name: string
}

function StarRating({ rating, onRatingChange, label, name }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            {star <= (hover || rating) ? (
              <StarIcon className="h-6 w-6 text-yellow-400" />
            ) : (
              <StarOutlineIcon className="h-6 w-6 text-gray-300" />
            )}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating}/5` : 'Click to rate'}
        </span>
      </div>
    </div>
  )
}

export function RatingForm({ campsiteId, onRatingSubmitted }: RatingFormProps) {
  const [loading, setLoading] = useState(false)
  const [existingRating, setExistingRating] = useState<any>(null)
  const { user, isAuthenticated } = useAuth()

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      score_overall: 0,
      score_quality: 0,
      score_facility: 0,
      score_safety: 0,
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    if (user) {
      loadExistingRating()
    }
  }, [user, campsiteId])

  const loadExistingRating = async () => {
    if (!user) return

    try {
      const rating = await getUserRatingForCampsite(campsiteId, user.id)
      if (rating) {
        setExistingRating(rating)
        setValue('score_overall', rating.score_overall || 0)
        setValue('score_quality', rating.score_quality || 0)
        setValue('score_facility', rating.score_facility || 0)
        setValue('score_safety', rating.score_safety || 0)
      }
    } catch (error) {
      console.error('Error loading existing rating:', error)
    }
  }

  const onSubmit = async (data: RatingFormData) => {
    if (!user) {
      toast.error('You must be signed in to rate')
      return
    }

    setLoading(true)
    try {
      await createOrUpdateRating({
        campsite_id: campsiteId,
        user_id: user.id,
        score_overall: data.score_overall,
        score_quality: data.score_quality || null,
        score_facility: data.score_facility || null,
        score_safety: data.score_safety || null,
      })

      toast.success(existingRating ? 'Rating updated successfully!' : 'Rating submitted successfully!')
      onRatingSubmitted()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit rating')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">Sign in to rate this program</p>
        <Button as="a" href="/auth" size="sm">
          Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {existingRating ? 'Update Your Rating' : 'Rate This Program'}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <StarRating
          rating={watchedValues.score_overall}
          onRatingChange={(rating) => setValue('score_overall', rating)}
          label="Overall Rating *"
          name="score_overall"
        />

        <StarRating
          rating={watchedValues.score_quality || 0}
          onRatingChange={(rating) => setValue('score_quality', rating)}
          label="Program Quality"
          name="score_quality"
        />

        <StarRating
          rating={watchedValues.score_facility || 0}
          onRatingChange={(rating) => setValue('score_facility', rating)}
          label="Facilities"
          name="score_facility"
        />

        <StarRating
          rating={watchedValues.score_safety || 0}
          onRatingChange={(rating) => setValue('score_safety', rating)}
          label="Safety"
          name="score_safety"
        />

        {errors.score_overall && (
          <p className="text-sm text-red-600">Overall rating is required</p>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Rating as <span className="font-medium">{user?.nickname || user?.email}</span>
          </p>
          <Button type="submit" loading={loading} disabled={loading || watchedValues.score_overall === 0}>
            {existingRating ? 'Update Rating' : 'Submit Rating'}
          </Button>
        </div>
      </form>
    </div>
  )
}