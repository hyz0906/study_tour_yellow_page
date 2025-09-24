'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { getCampsiteById, type Campsite } from '@/lib/campsites'
import { CommentForm } from '@/components/comments/CommentForm'
import { CommentList } from '@/components/comments/CommentList'
import { RatingForm } from '@/components/ratings/RatingForm'
import { RatingSummary } from '@/components/ratings/RatingSummary'
import { ShareButton } from '@/components/social/ShareButton'
import { Button } from '@/components/ui/Button'

interface CampsiteDetailPageProps {
  params: {
    id: string
  }
}

export default function CampsiteDetailPage({ params }: CampsiteDetailPageProps) {
  const [campsite, setCampsite] = useState<Campsite | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    loadCampsite()
  }, [params.id])

  const loadCampsite = async () => {
    try {
      const data = await getCampsiteById(params.id)
      if (!data) {
        notFound()
      }
      setCampsite(data)
    } catch (error) {
      console.error('Error loading campsite:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const renderStars = (rating: number | null) => {
    const stars = []
    const ratingValue = rating || 0

    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(
          <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
        )
      } else {
        stars.push(
          <StarOutlineIcon key={i} className="h-5 w-5 text-gray-300" />
        )
      }
    }

    return stars
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      summer: 'bg-orange-100 text-orange-800',
      winter: 'bg-blue-100 text-blue-800',
      study: 'bg-purple-100 text-purple-800',
      online: 'bg-green-100 text-green-800',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-300 rounded-lg mb-6" />
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-6" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded w-3/4" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!campsite) {
    return notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-primary-600">
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <Link href="/campsites" className="ml-1 text-gray-700 hover:text-primary-600 md:ml-2">
                Campsites
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-gray-500 md:ml-2">{campsite.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Hero Image */}
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6">
            <Image
              src={campsite.thumbnail_url || '/placeholder-campsite.jpg'}
              alt={campsite.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Title and Rating */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{campsite.name}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(campsite.category)}`}>
                {campsite.category}
              </span>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                {renderStars(campsite.avg_rating)}
                {campsite.avg_rating && (
                  <span className="ml-2 text-sm text-gray-600">
                    {campsite.avg_rating.toFixed(1)} / 5.0
                  </span>
                )}
              </div>

              {campsite.country && (
                <div className="flex items-center text-gray-600">
                  <GlobeAltIcon className="h-5 w-5 mr-1" />
                  <span>{campsite.country}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {campsite.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Program</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">{campsite.description}</p>
              </div>
            </div>
          )}

          {/* Ratings Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ratings & Reviews</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <RatingSummary campsiteId={campsite.id} refreshTrigger={refreshTrigger} />
              <RatingForm campsiteId={campsite.id} onRatingSubmitted={handleRefresh} />
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t pt-8">
            <div className="space-y-6">
              <CommentForm campsiteId={campsite.id} onCommentAdded={handleRefresh} />
              <CommentList campsiteId={campsite.id} refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Details</h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900 capitalize">{campsite.category}</span>
              </div>

              {campsite.country && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{campsite.country}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rating:</span>
                <div className="flex items-center">
                  {renderStars(campsite.avg_rating)}
                  {campsite.avg_rating && (
                    <span className="ml-1 text-sm text-gray-600">
                      ({campsite.avg_rating.toFixed(1)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={campsite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full">
                  Visit Official Website
                </Button>
              </a>

              <Button variant="outline" className="w-full">
                Save to Favorites
              </Button>

              <ShareButton
                url={typeof window !== 'undefined' ? window.location.href : campsite.url}
                title={`Check out ${campsite.name} - ${campsite.category} program`}
                variant="ghost"
                size="md"
              />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Last updated: {new Date(campsite.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}