import { getRequestConfig } from 'next-intl/server'
import enMessages from './messages/en.json'
import zhMessages from './messages/zh.json'

export const locales = ['en', 'zh'] as const
export const defaultLocale = 'en' as const

const messages = {
  en: enMessages,
  zh: zhMessages
}

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    return {
      messages: messages.en
    }
  }

  return {
    messages: messages[locale as keyof typeof messages]
  }
})