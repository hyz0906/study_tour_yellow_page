'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/Button'
import { getCampsites, type Campsite } from '@/lib/campsites'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

export default function CampsitesManagement() {
  const { t, locale } = useTranslation()
  const [campsites, setCampsites] = useState<Campsite[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pageSize: 10,
  })

  useEffect(() => {
    loadCampsites()
  }, [pagination.page])

  const loadCampsites = async () => {
    setLoading(true)
    try {
      const response = await getCampsites({}, pagination.page, pagination.pageSize)
      setCampsites(response.data)
      setPagination(prev => ({ ...prev, total: response.count }))
    } catch (error) {
      toast.error('Failed to load campsites')
      console.error('Error loading campsites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (campsiteId: string) => {
    if (!confirm(t('admin.campsites.deleteConfirm'))) {
      return
    }

    setDeleting(campsiteId)
    try {
      // Call delete API
      const response = await fetch(`/api/admin/campsites/${campsiteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      toast.success(t('admin.campsites.deleteSuccess'))
      await loadCampsites()
    } catch (error) {
      toast.error(t('admin.campsites.operationError'))
      console.error('Error deleting campsite:', error)
    } finally {
      setDeleting(null)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      summer: t('campsites.categories.summer'),
      winter: t('campsites.categories.winter'),
      study: t('campsites.categories.study'),
      online: t('campsites.categories.online'),
    }
    return labels[category as keyof typeof labels] || category
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.campsites.title')}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {t('admin.campsites.subtitle')}
            </p>
          </div>

          <Button
            onClick={() => {
              window.location.href = `/${locale}/admin/campsites/create`
            }}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('admin.campsites.addNew')}
          </Button>
        </div>

        {/* Campsites Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : campsites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No campsites found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campsites.map((campsite) => (
                    <tr key={campsite.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={campsite.image_url || '/placeholder.jpg'}
                              alt={campsite.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {campsite.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {campsite.description?.slice(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getCategoryLabel(campsite.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campsite.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campsite.avg_rating ? `${campsite.avg_rating.toFixed(1)} ⭐` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(campsite.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.location.href = `/${locale}/admin/campsites/${campsite.id}/edit`
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(campsite.id)}
                            loading={deleting === campsite.id}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {Math.ceil(pagination.total / pagination.pageSize) > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
            </p>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                {t('common.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}