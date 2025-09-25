import { supabase } from './supabase'
import { Database } from '@/types/database'

export type Report = Database['public']['Tables']['reports']['Row'] & {
  users?: {
    nickname: string | null
    email: string | null
  } | null
  comments?: {
    content: string
    campsites?: {
      name: string
    } | null
  } | null
}

export interface AdminStats {
  totalCampsites: number
  totalUsers: number
  totalComments: number
  totalReports: number
  pendingReports: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const [
    { count: totalCampsites },
    { count: totalUsers },
    { count: totalComments },
    { count: totalReports },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from('campsites').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return {
    totalCampsites: totalCampsites || 0,
    totalUsers: totalUsers || 0,
    totalComments: totalComments || 0,
    totalReports: totalReports || 0,
    pendingReports: pendingReports || 0,
  }
}

export async function getReports(
  page: number = 1,
  pageSize: number = 10,
  status?: string
): Promise<{ data: Report[], count: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('reports')
    .select(`
      *,
      users!reports_reporter_id_fkey (
        nickname,
        email
      ),
      comments (
        content,
        campsites (
          name
        )
      )
    `, { count: 'exact' })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: data as Report[],
    count: count || 0,
  }
}

export async function updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'rejected'): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', reportId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateCommentStatus(
  commentId: string,
  status: 'published' | 'pending' | 'hidden' | 'deleted'
): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .update({ status })
    .eq('id', commentId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function getRecentComments(limit: number = 10): Promise<any[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      users (
        nickname,
        email
      ),
      campsites (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function getRecentUsers(limit: number = 10): Promise<any[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}