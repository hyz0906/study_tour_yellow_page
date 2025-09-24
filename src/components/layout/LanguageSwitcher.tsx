'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'

export function LanguageSwitcher() {
  const { locale } = useTranslation()
  const pathname = usePathname()

  // Remove the current locale from pathname to get the base path
  const basePath = pathname?.replace(/^\/[a-z]{2}/, '') || ''

  return (
    <div className="flex items-center space-x-4">
      <Link
        href={`/en${basePath}`}
        className={`text-sm hover:text-gray-900 ${
          locale === 'en' ? 'text-blue-600 font-semibold' : 'text-gray-600'
        }`}
      >
        English
      </Link>
      <Link
        href={`/zh${basePath}`}
        className={`text-sm hover:text-gray-900 ${
          locale === 'zh' ? 'text-blue-600 font-semibold' : 'text-gray-600'
        }`}
      >
        中文
      </Link>
    </div>
  )
}