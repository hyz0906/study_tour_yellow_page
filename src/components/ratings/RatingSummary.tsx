'use client'

import { useState, useEffect } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { getRatingSummary, type RatingSummary as RatingSummaryType } from '@/lib/ratings'

interface RatingSummaryProps {
  campsiteId: string
  refreshTrigger: number
}

function RatingBar({ label, rating }: { label: string; rating: number }) {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-600 w-20">{label}:</span>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarOutlineIcon className="h-4 w-4 text-gray-300" />
            )}
          </div>
        ))}
        <span className="text-sm text-gray-600 ml-2">
          {rating > 0 ? rating.toFixed(1) : 'N/A'}
        </span>
      </div>
    </div>
  )
}

function DistributionBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 w-8">{stars}★</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-yellow-400 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 w-8">{count}</span>
    </div>
  )
}

export function RatingSummary({ campsiteId, refreshTrigger }: RatingSummaryProps) {
  const [summary, setSummary] = useState<RatingSummaryType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRatingSummary()
  }, [campsiteId, refreshTrigger])

  const loadRatingSummary = async () => {
    setLoading(true)
    try {
      const data = await getRatingSummary(campsiteId)
      setSummary(data)
    } catch (error) {
      console.error('Error loading rating summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-4 bg-gray-300 rounded w-16" />
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-4 w-4 bg-gray-300 rounded" />
                ))}
              </div>
              <div className="h-4 bg-gray-300 rounded w-8" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Ratings & Reviews</h3>

      {summary.totalRatings === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">No ratings yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to rate this program!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Rating */}
          <div className="text-center pb-4 border-b border-gray-200">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {summary.averageOverall.toFixed(1)}
            </div>
            <div className="flex justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star}>
                  {star <= summary.averageOverall ? (
                    <StarIcon className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <StarOutlineIcon className="h-6 w-6 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Based on {summary.totalRatings} review{summary.totalRatings !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-3">
            <RatingBar label="Overall" rating={summary.averageOverall} />
            {summary.averageQuality > 0 && (
              <RatingBar label="Quality" rating={summary.averageQuality} />
            )}
            {summary.averageFacility > 0 && (
              <RatingBar label="Facilities" rating={summary.averageFacility} />
            )}
            {summary.averageSafety > 0 && (
              <RatingBar label="Safety" rating={summary.averageSafety} />
            )}
          </div>

          {/* Distribution */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <DistributionBar
                  key={stars}
                  stars={stars}
                  count={summary.distribution[stars as keyof typeof summary.distribution]}
                  total={summary.totalRatings}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}