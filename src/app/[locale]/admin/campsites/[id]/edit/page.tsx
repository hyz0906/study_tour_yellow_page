'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/Button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

interface EditCampsiteProps {
  params: {
    id: string
  }
}

export default function EditCampsite({ params }: EditCampsiteProps) {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'summer',
    country: '',
    city: '',
    address: '',
    price: '',
    max_participants: '',
    age_min: '',
    age_max: '',
    image_url: '',
    contact_email: '',
    contact_phone: '',
    website_url: ''
  })

  useEffect(() => {
    loadCampsite()
  }, [params.id])

  const loadCampsite = async () => {
    try {
      const response = await fetch(`/api/admin/campsites/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to load campsite')
      }

      const { data } = await response.json()
      setFormData({
        name: data.name || '',
        description: data.description || '',
        category: data.category || 'summer',
        country: data.country || '',
        city: data.city || '',
        address: data.address || '',
        price: data.price?.toString() || '',
        max_participants: data.max_participants?.toString() || '',
        age_min: data.age_min?.toString() || '',
        age_max: data.age_max?.toString() || '',
        image_url: data.image_url || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        website_url: data.website_url || ''
      })
    } catch (error) {
      toast.error(t('admin.campsites.operationError'))
      console.error('Error loading campsite:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/campsites/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          age_min: formData.age_min ? parseInt(formData.age_min) : null,
          age_max: formData.age_max ? parseInt(formData.age_max) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update campsite')
      }

      toast.success(t('admin.campsites.updateSuccess'))
      router.push(`/${locale}/admin/campsites`)
    } catch (error) {
      toast.error(t('admin.campsites.operationError'))
      console.error('Error updating campsite:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (initialLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/admin/campsites`)}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.campsites.editCampsite')}</h1>
            <p className="mt-1 text-sm text-gray-600">Update campsite information</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="summer">{t('campsites.categories.summer')}</option>
                    <option value="winter">{t('campsites.categories.winter')}</option>
                    <option value="study">{t('campsites.categories.study')}</option>
                    <option value="online">{t('campsites.categories.online')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Details</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (USD)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Participants</label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleChange}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Age</label>
                    <input
                      type="number"
                      name="age_min"
                      value={formData.age_min}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Age</label>
                    <input
                      type="number"
                      name="age_max"
                      value={formData.age_max}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Website URL</label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Describe the campsite, activities, and what makes it special..."
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Complete address including street, city, state, postal code"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${locale}/admin/campsites`)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={loading}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}