export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          nickname: string | null
          avatar_url: string | null
          bio: string | null
          interests: string[] | null
          role: 'user' | 'organizer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          nickname?: string | null
          avatar_url?: string | null
          bio?: string | null
          interests?: string[] | null
          role?: 'user' | 'organizer' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          nickname?: string | null
          avatar_url?: string | null
          bio?: string | null
          interests?: string[] | null
          role?: 'user' | 'organizer' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      campsites: {
        Row: {
          id: string
          name: string
          url: string
          country: string | null
          category: 'summer' | 'winter' | 'study' | 'online'
          description: string | null
          thumbnail_url: string | null
          avg_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          country?: string | null
          category?: 'summer' | 'winter' | 'study' | 'online'
          description?: string | null
          thumbnail_url?: string | null
          avg_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          country?: string | null
          category?: 'summer' | 'winter' | 'study' | 'online'
          description?: string | null
          thumbnail_url?: string | null
          avg_rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string | null
          campsite_id: string | null
          content: string
          images: string[] | null
          likes: number | null
          dislikes: number | null
          status: 'published' | 'pending' | 'hidden' | 'deleted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          campsite_id?: string | null
          content: string
          images?: string[] | null
          likes?: number | null
          dislikes?: number | null
          status?: 'published' | 'pending' | 'hidden' | 'deleted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          campsite_id?: string | null
          content?: string
          images?: string[] | null
          likes?: number | null
          dislikes?: number | null
          status?: 'published' | 'pending' | 'hidden' | 'deleted'
          created_at?: string
          updated_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          user_id: string | null
          campsite_id: string | null
          score_quality: number | null
          score_facility: number | null
          score_safety: number | null
          score_overall: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          campsite_id?: string | null
          score_quality?: number | null
          score_facility?: number | null
          score_safety?: number | null
          score_overall?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          campsite_id?: string | null
          score_quality?: number | null
          score_facility?: number | null
          score_safety?: number | null
          score_overall?: number | null
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string | null
          comment_id: string | null
          reason: string
          status: 'pending' | 'reviewed' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id?: string | null
          comment_id?: string | null
          reason: string
          status?: 'pending' | 'reviewed' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string | null
          comment_id?: string | null
          reason?: string
          status?: 'pending' | 'reviewed' | 'rejected'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'organizer' | 'admin'
      campsite_category: 'summer' | 'winter' | 'study' | 'online'
      comment_status: 'published' | 'pending' | 'hidden' | 'deleted'
      report_status: 'pending' | 'reviewed' | 'rejected'
    }
  }
}