import { supabase } from './supabase'
import { Database } from '@/types/database'

export type Follow = Database['public']['Tables']['follows']['Row']

export interface UserProfile {
  id: string
  nickname: string | null
  avatar_url: string | null
  bio: string | null
}

export interface FollowStats {
  followersCount: number
  followingCount: number
  isFollowing: boolean
}

export async function followUser(followingId: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  if (user.id === followingId) {
    throw new Error('Cannot follow yourself')
  }

  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: followingId,
    })

  if (error) {
    throw new Error(error.message)
  }
}

export async function unfollowUser(followingId: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function getFollowStats(userId: string, currentUserId?: string): Promise<FollowStats> {
  // Get followers count
  const { count: followersCount, error: followersError } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  if (followersError) {
    throw new Error(followersError.message)
  }

  // Get following count
  const { count: followingCount, error: followingError } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  if (followingError) {
    throw new Error(followingError.message)
  }

  // Check if current user is following this user
  let isFollowing = false
  if (currentUserId && currentUserId !== userId) {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', currentUserId)
      .eq('following_id', userId)
      .single()

    if (!error && data) {
      isFollowing = true
    }
  }

  return {
    followersCount: followersCount || 0,
    followingCount: followingCount || 0,
    isFollowing,
  }
}

export async function getFollowers(userId: string, page: number = 1, pageSize: number = 20): Promise<{ data: UserProfile[], count: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('follows')
    .select(`
      follower_id,
      users!follows_follower_id_fkey (
        id,
        nickname,
        avatar_url,
        bio
      )
    `, { count: 'exact' })
    .eq('following_id', userId)
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  const followers = data?.map(follow => follow.users).filter(Boolean) as UserProfile[]

  return {
    data: followers || [],
    count: count || 0,
  }
}

export async function getFollowing(userId: string, page: number = 1, pageSize: number = 20): Promise<{ data: UserProfile[], count: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('follows')
    .select(`
      following_id,
      users!follows_following_id_fkey (
        id,
        nickname,
        avatar_url,
        bio
      )
    `, { count: 'exact' })
    .eq('follower_id', userId)
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  const following = data?.map(follow => follow.users).filter(Boolean) as UserProfile[]

  return {
    data: following || [],
    count: count || 0,
  }
}

export async function shareToSocialMedia(url: string, title: string, platform: string): Promise<void> {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  }

  const shareUrl = shareUrls[platform as keyof typeof shareUrls]
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'absolute'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
    } catch (err) {
      throw new Error('Failed to copy to clipboard')
    } finally {
      textArea.remove()
    }
  }
}