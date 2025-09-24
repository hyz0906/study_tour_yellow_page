'use client'

import { CampsiteCard } from './CampsiteCard'
import { Campsite } from '@/lib/campsites'

interface CampsiteGridProps {
  campsites: Campsite[]
  loading?: boolean
}

export function CampsiteGrid({ campsites, loading }: CampsiteGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-3 bg-gray-300 rounded w-1/2" />
              <div className="h-3 bg-gray-300 rounded w-full" />
              <div className="h-3 bg-gray-300 rounded w-full" />
              <div className="flex justify-between items-center">
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-4 w-4 bg-gray-300 rounded" />
                  ))}
                </div>
                <div className="h-4 bg-gray-300 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (campsites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campsites found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {campsites.map((campsite) => (
        <CampsiteCard key={campsite.id} campsite={campsite} />
      ))}
    </div>
  )
}