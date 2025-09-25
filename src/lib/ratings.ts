import { supabase } from './supabase'
import { Database } from '@/types/database'

export type Rating = Database['public']['Tables']['ratings']['Row']
export type RatingInsert = Database['public']['Tables']['ratings']['Insert']
export type RatingUpdate = Database['public']['Tables']['ratings']['Update']

export interface RatingSummary {
  averageOverall: number
  averageQuality: number
  averageFacility: number
  averageSafety: number
  totalRatings: number
  distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export async function getRatingsByCampsite(campsiteId: string): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('campsite_id', campsiteId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getRatingSummary(campsiteId: string): Promise<RatingSummary> {
  const { data, error } = await supabase
    .from('ratings')
    .select('score_overall, score_quality, score_facility, score_safety')
    .eq('campsite_id', campsiteId)

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    return {
      averageOverall: 0,
      averageQuality: 0,
      averageFacility: 0,
      averageSafety: 0,
      totalRatings: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  }

  const totalRatings = data.length
  const validOverallRatings = data.filter(r => r.score_overall).map(r => r.score_overall!)
  const validQualityRatings = data.filter(r => r.score_quality).map(r => r.score_quality!)
  const validFacilityRatings = data.filter(r => r.score_facility).map(r => r.score_facility!)
  const validSafetyRatings = data.filter(r => r.score_safety).map(r => r.score_safety!)

  const averageOverall = validOverallRatings.length > 0
    ? validOverallRatings.reduce((sum, rating) => sum + rating, 0) / validOverallRatings.length
    : 0

  const averageQuality = validQualityRatings.length > 0
    ? validQualityRatings.reduce((sum, rating) => sum + rating, 0) / validQualityRatings.length
    : 0

  const averageFacility = validFacilityRatings.length > 0
    ? validFacilityRatings.reduce((sum, rating) => sum + rating, 0) / validFacilityRatings.length
    : 0

  const averageSafety = validSafetyRatings.length > 0
    ? validSafetyRatings.reduce((sum, rating) => sum + rating, 0) / validSafetyRatings.length
    : 0

  // Calculate distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  validOverallRatings.forEach(rating => {
    distribution[rating as keyof typeof distribution]++
  })

  return {
    averageOverall: Math.round(averageOverall * 10) / 10,
    averageQuality: Math.round(averageQuality * 10) / 10,
    averageFacility: Math.round(averageFacility * 10) / 10,
    averageSafety: Math.round(averageSafety * 10) / 10,
    totalRatings,
    distribution
  }
}

export async function getUserRatingForCampsite(campsiteId: string, userId: string): Promise<Rating | null> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('campsite_id', campsiteId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(error.message)
  }

  return data
}

export async function createOrUpdateRating(rating: RatingInsert): Promise<Rating> {
  const { data, error } = await supabase
    .from('ratings')
    .upsert(rating)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteRating(campsiteId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('campsite_id', campsiteId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }
}