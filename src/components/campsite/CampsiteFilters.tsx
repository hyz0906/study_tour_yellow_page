'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface CampsiteFiltersProps {
  onFiltersChange: (filters: {
    search?: string
    country?: string
    category?: string
    minRating?: number
  }) => void
  countries: string[]
  loading?: boolean
}

export function CampsiteFilters({ onFiltersChange, countries, loading }: CampsiteFiltersProps) {
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [category, setCategory] = useState('')
  const [minRating, setMinRating] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({
      search: search || undefined,
      country: country || undefined,
      category: category || undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
    })
  }

  const handleReset = () => {
    setSearch('')
    setCountry('')
    setCategory('')
    setMinRating('')
    onFiltersChange({})
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campsites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <Button type="submit" loading={loading}>
            Search
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                <option value="summer">Summer</option>
                <option value="winter">Winter</option>
                <option value="study">Study</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Any Rating</option>
                <option value="1">1+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <Button type="button" variant="ghost" onClick={handleReset}>
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}