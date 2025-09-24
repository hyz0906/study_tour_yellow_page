'use client'

import { useState, useEffect } from 'react'
import { getCampsites, getCountries, type CampsiteFilters } from '@/lib/campsites'
import { CampsiteGrid } from '@/components/campsite/CampsiteGrid'
import { CampsiteFilters } from '@/components/campsite/CampsiteFilters'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

export default function CampsitesPage() {
  const [campsites, setCampsites] = useState([])
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<CampsiteFilters>({})
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
  })

  useEffect(() => {
    loadCountries()
  }, [])

  useEffect(() => {
    loadCampsites()
  }, [filters, pagination.page])

  const loadCountries = async () => {
    try {
      const data = await getCountries()
      setCountries(data)
    } catch (error) {
      console.error('Error loading countries:', error)
    }
  }

  const loadCampsites = async () => {
    setLoading(true)
    try {
      const response = await getCampsites(filters, pagination.page, pagination.pageSize)
      setCampsites(response.data)
      setPagination(prev => ({ ...prev, total: response.count }))
    } catch (error) {
      toast.error('Failed to load campsites')
      console.error('Error loading campsites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: CampsiteFilters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleLoadMore = () => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
  }

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)
  const hasMore = pagination.page < totalPages

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Discover Amazing Campsites
        </h1>
        <p className="text-lg text-gray-600">
          Explore {pagination.total} carefully curated study tours and educational programs worldwide
        </p>
      </div>

      <CampsiteFilters
        onFiltersChange={handleFiltersChange}
        countries={countries}
        loading={loading}
      />

      <CampsiteGrid campsites={campsites} loading={loading} />

      {hasMore && !loading && (
        <div className="text-center mt-8">
          <Button onClick={handleLoadMore} size="lg">
            Load More Campsites
          </Button>
        </div>
      )}

      {campsites.length > 0 && (
        <div className="text-center mt-8 text-sm text-gray-500">
          Showing {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} campsites
        </div>
      )}
    </div>
  )
}