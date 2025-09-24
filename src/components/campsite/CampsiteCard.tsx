import Link from 'next/link'
import Image from 'next/image'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { Campsite } from '@/lib/campsites'

interface CampsiteCardProps {
  campsite: Campsite
}

export function CampsiteCard({ campsite }: CampsiteCardProps) {
  const renderStars = (rating: number | null) => {
    const stars = []
    const ratingValue = rating || 0

    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(
          <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
        )
      } else {
        stars.push(
          <StarOutlineIcon key={i} className="h-4 w-4 text-gray-300" />
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

  return (
    <Link href={`/campsites/${campsite.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group">
        <div className="relative h-48 w-full">
          <Image
            src={campsite.thumbnail_url || '/placeholder-campsite.jpg'}
            alt={campsite.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(campsite.category)}`}>
              {campsite.category}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {campsite.name}
          </h3>

          {campsite.country && (
            <p className="text-sm text-gray-600 mb-2">
              📍 {campsite.country}
            </p>
          )}

          {campsite.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {campsite.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {renderStars(campsite.avg_rating)}
              {campsite.avg_rating && (
                <span className="text-sm text-gray-600 ml-1">
                  {campsite.avg_rating.toFixed(1)}
                </span>
              )}
            </div>

            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}