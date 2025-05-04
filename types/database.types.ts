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
      bookings: {
        Row: {
          id: string
          created_at: string
          user_id: string
          provider_id: string
          skill_id: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          date: string
          time_slot: string
          notes?: string
          payment_status?: 'pending' | 'completed'
          payment_amount?: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          provider_id: string
          skill_id: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          date: string
          time_slot: string
          notes?: string
          payment_status?: 'pending' | 'completed'
          payment_amount?: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          provider_id?: string
          skill_id?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          date?: string
          time_slot?: string
          notes?: string
          payment_status?: 'pending' | 'completed'
          payment_amount?: number
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          recipient_id: string
          content: string
          read: boolean
          conversation_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          sender_id: string
          recipient_id: string
          content: string
          read?: boolean
          conversation_id: string
        }
        Update: {
          id?: string
          created_at?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          read?: boolean
          conversation_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          first_name: string
          last_name: string
          avatar_url?: string
          bio?: string
          location?: string
          is_provider: boolean
          rating?: number
          availability?: Json
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          first_name: string
          last_name: string
          avatar_url?: string
          bio?: string
          location?: string
          is_provider?: boolean
          rating?: number
          availability?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          first_name?: string
          last_name?: string
          avatar_url?: string
          bio?: string
          location?: string
          is_provider?: boolean
          rating?: number
          availability?: Json
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          user_id: string
          provider_id: string
          skill_id: string
          booking_id: string
          rating: number
          comment?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          provider_id: string
          skill_id: string
          booking_id: string
          rating: number
          comment?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          provider_id?: string
          skill_id?: string
          booking_id?: string
          rating?: number
          comment?: string
        }
      }
      skills: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          category: string
          provider_id: string
          price?: number
          duration: number
          image_url?: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          category: string
          provider_id: string
          price?: number
          duration: number
          image_url?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          category?: string
          provider_id?: string
          price?: number
          duration?: number
          image_url?: string
          is_active?: boolean
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
      [_ in never]: never
    }
  }
}