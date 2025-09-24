import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'zh'] as const
export const defaultLocale = 'en' as const

export default getRequestConfig(async ({ locale }) => {
  console.log('getRequestConfig called with locale:', locale)

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) {
    console.log('Invalid locale, triggering notFound')
    notFound()
  }

  console.log('Loading messages for locale:', locale)

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  }
})