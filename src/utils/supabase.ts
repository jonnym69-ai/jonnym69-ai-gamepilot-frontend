import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          subscription_tier: string
          subscription_id: string | null
          subscription_status: string | null
          subscription_end_date: string | null
          rawg_api_calls_today: number
          rawg_api_calls_reset: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          subscription_tier?: string
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_end_date?: string | null
          rawg_api_calls_today?: number
          rawg_api_calls_reset?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          subscription_tier?: string
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_end_date?: string | null
          rawg_api_calls_today?: number
          rawg_api_calls_reset?: string
          created_at?: string
          updated_at?: string
        }
      }
      gaming_sessions: {
        Row: {
          id: string
          user_id: string
          game_id: string
          game_name: string
          mood_tags: string[] | null
          genre_tags: string[] | null
          session_length: number
          started_at: string
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          game_name: string
          mood_tags?: string[] | null
          genre_tags?: string[] | null
          session_length: number
          started_at: string
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          game_name?: string
          mood_tags?: string[] | null
          genre_tags?: string[] | null
          session_length?: number
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          game_id: string
          recommendation_type: string
          confidence_score: number
          was_clicked: boolean
          was_purchased: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          recommendation_type: string
          confidence_score: number
          was_clicked?: boolean
          was_purchased?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          recommendation_type?: string
          confidence_score?: number
          was_clicked?: boolean
          was_purchased?: boolean
          created_at?: string
        }
      }
    }
  }
}
