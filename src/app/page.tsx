import { redirect } from 'next/navigation'

export default function RootPage() {
  // This should not be reached with the middleware, but just in case
  redirect('/en')
}