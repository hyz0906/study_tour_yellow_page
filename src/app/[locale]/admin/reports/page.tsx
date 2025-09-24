'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/Button'
import { getReports, updateReportStatus, updateCommentStatus, type Report } from '@/lib/admin'
import { toast } from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

export default function AdminReports() {
  const { t } = useTranslation()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState('pending')
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pageSize: 10,
  })

  useEffect(() => {
    loadReports()
  }, [filter, pagination.page])

  const loadReports = async () => {
    setLoading(true)
    try {
      const response = await getReports(
        pagination.page,
        pagination.pageSize,
        filter === 'all' ? undefined : filter
      )
      setReports(response.data)
      setPagination(prev => ({ ...prev, total: response.count }))
    } catch (error) {
      toast.error('Failed to load reports')
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportAction = async (reportId: string, action: 'reviewed' | 'rejected') => {
    setProcessing(reportId)
    try {
      await updateReportStatus(reportId, action)
      toast.success(t('admin.reports.actionSuccess'))
      await loadReports()
    } catch (error) {
      toast.error(t('admin.reports.actionError'))
    } finally {
      setProcessing(null)
    }
  }

  const handleCommentAction = async (
    commentId: string,
    action: 'hidden' | 'deleted' | 'published'
  ) => {
    setProcessing(commentId)
    try {
      await updateCommentStatus(commentId, action)
      toast.success(t('admin.reports.actionSuccess'))
      await loadReports()
    } catch (error) {
      toast.error(t('admin.reports.actionError'))
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.reports.title')}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {t('admin.reports.subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="pending">{t('common.pending')}</option>
              <option value="reviewed">Reviewed</option>
              <option value="rejected">{t('common.rejected')}</option>
              <option value="all">All Reports</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reports found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={report.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}
                        >
                          {report.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {t('admin.reports.reportedBy')} {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t('admin.reports.reason')}
                        </h3>
                        <p className="text-gray-700">{report.reason}</p>
                      </div>

                      {report.comments && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            {t('admin.reports.reportedContent')}
                          </h4>
                          <p className="text-sm text-gray-700 mb-2">
                            {report.comments.content}
                          </p>
                          {report.comments.campsites && (
                            <p className="text-xs text-gray-500">
                              On: {report.comments.campsites.name}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="text-sm text-gray-500">
                        {t('admin.reports.reportedBy')}: {report.users?.nickname || report.users?.email || 'Unknown'}
                      </div>
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleReportAction(report.id, 'reviewed')}
                          loading={processing === report.id}
                        >
                          {t('admin.reports.markReviewed')}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'rejected')}
                          loading={processing === report.id}
                        >
                          {t('admin.reports.rejectReport')}
                        </Button>

                        {report.comment_id && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCommentAction(report.comment_id!, 'hidden')}
                              loading={processing === report.comment_id}
                            >
                              {t('admin.reports.hideComment')}
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleCommentAction(report.comment_id!, 'deleted')}
                              loading={processing === report.comment_id}
                            >
                              {t('admin.reports.deleteComment')}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
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