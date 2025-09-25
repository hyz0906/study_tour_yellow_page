import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { mockSupabase, MockSupabaseClient } from './mock-supabase'

// Detect if we're in test mode (no Supabase credentials provided or explicitly enabled)
const isTestMode =
  process.env.NEXT_PUBLIC_TEST_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: any

if (isTestMode) {
  // Use mock Supabase client for development/testing without real Supabase
  console.log('🧪 Running in test mode with mock Supabase client')
  supabase = mockSupabase as MockSupabaseClient
} else {
  // Use real Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  if (error?.message) {
    console.error('Supabase Error:', error.message)
    return error.message
  }
  return 'An unexpected error occurred'
}