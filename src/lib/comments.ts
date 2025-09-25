import { supabase } from './supabase'
import { Database } from '@/types/database'

export type Comment = Database['public']['Tables']['comments']['Row'] & {
  users?: {
    nickname: string | null
    avatar_url: string | null
  } | null
}

export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']

export interface CommentWithUser extends Comment {
  users: {
    nickname: string | null
    avatar_url: string | null
  } | null
}

export async function getCommentsByCampsite(
  campsiteId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: CommentWithUser[], count: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('comments')
    .select(`
      *,
      users (
        nickname,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('campsite_id', campsiteId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return {
    data: data as CommentWithUser[],
    count: count || 0,
  }
}

export async function createComment(comment: CommentInsert): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateComment(id: string, updates: CommentUpdate): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function likeComment(commentId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_comment_likes', {
    comment_id: commentId
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function dislikeComment(commentId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_comment_dislikes', {
    comment_id: commentId
  })

  if (error) {
    throw new Error(error.message)
  }
}