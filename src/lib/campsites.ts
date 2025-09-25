import { supabase } from './supabase'
import { Database } from '@/types/database'

export type Campsite = Database['public']['Tables']['campsites']['Row']
export type CampsiteInsert = Database['public']['Tables']['campsites']['Insert']
export type CampsiteUpdate = Database['public']['Tables']['campsites']['Update']

export interface CampsiteFilters {
  search?: string
  country?: string
  category?: 'summer' | 'winter' | 'study' | 'online'
  minRating?: number
}

export interface CampsiteListResponse {
  data: Campsite[]
  count: number
}

export async function getCampsites(
  filters: CampsiteFilters = {},
  page: number = 1,
  pageSize: number = 12
): Promise<CampsiteListResponse> {
  let query = supabase
    .from('campsites')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters.country) {
    query = query.eq('country', filters.country)
  }

  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  if (filters.minRating) {
    query = query.gte('avg_rating', filters.minRating)
  }

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query
    .order('avg_rating', { ascending: false, nullsLast: true })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: data || [],
    count: count || 0,
  }
}

export async function getCampsiteById(id: string): Promise<Campsite | null> {
  const { data, error } = await supabase
    .from('campsites')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(error.message)
  }

  return data
}

export async function createCampsite(campsite: CampsiteInsert): Promise<Campsite> {
  const { data, error } = await supabase
    .from('campsites')
    .insert(campsite)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateCampsite(id: string, updates: CampsiteUpdate): Promise<Campsite> {
  const { data, error } = await supabase
    .from('campsites')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteCampsite(id: string): Promise<void> {
  const { error } = await supabase
    .from('campsites')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function getCountries(): Promise<string[]> {
  const { data, error } = await supabase
    .from('campsites')
    .select('country')
    .not('country', 'is', null)
    .order('country')

  if (error) {
    throw new Error(error.message)
  }

  const countries = Array.from(new Set(data.map(item => item.country).filter(Boolean)))
  return countries as string[]
}