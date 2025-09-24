import { useParams } from 'next/navigation'
import enMessages from '../messages/en.json'
import zhMessages from '../messages/zh.json'

const messages = {
  en: enMessages,
  zh: zhMessages
}

export function useTranslation() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  const currentMessages = messages[locale as keyof typeof messages] || messages.en

  const t = (key: string) => {
    if (key === 'locale') return locale

    const keys = key.split('.')
    let value: any = currentMessages

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return { t, locale }
}