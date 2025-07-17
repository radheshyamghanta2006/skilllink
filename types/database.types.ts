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
          name: string
          email: string
          role: 'seeker' | 'provider' | 'both' | 'admin'
          current_mode?: 'seeker' | 'provider' | null
          profile_image?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          distance?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: {
          id: string
          name: string
          email: string
          role: 'seeker' | 'provider' | 'both' | 'admin'
          current_mode?: 'seeker' | 'provider' | null
          profile_image?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          distance?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'seeker' | 'provider' | 'both' | 'admin'
          current_mode?: 'seeker' | 'provider' | null
          profile_image?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          distance?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      skills: {
        Row: {
          id: string
          user_id: string
          skill_name: string
          category: string
          intent: 'provider' | 'seeker'
          description?: string | null
          created_at?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          skill_name: string
          category: string
          intent: 'provider' | 'seeker'
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          skill_name?: string
          category?: string
          intent?: 'provider' | 'seeker'
          description?: string | null
          created_at?: string | null
        }
      }
      availability_slots: {
        Row: {
          id: string
          provider_id: string
          date: string
          start_time: string
          end_time: string
          is_available?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: {
          id?: string
          provider_id: string
          date: string
          start_time: string
          end_time: string
          is_available?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          provider_id?: string
          date?: string
          start_time?: string
          end_time?: string
          is_available?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          seeker_id: string
          provider_id: string
          slot_id?: string | null
          date: string
          start_time: string
          end_time: string
          service_name: string
          notes?: string | null
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'refunded'
          payment_amount?: number | null
          payment_id?: string | null
          is_skill_swap?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: {
          id?: string
          seeker_id: string
          provider_id: string
          slot_id?: string | null
          date: string
          start_time: string
          end_time: string
          service_name: string
          notes?: string | null
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'refunded'
          payment_amount?: number | null
          payment_id?: string | null
          is_skill_swap?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          seeker_id?: string
          provider_id?: string
          slot_id?: string | null
          date?: string
          start_time?: string
          end_time?: string
          service_name?: string
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_amount?: number | null
          payment_id?: string | null
          is_skill_swap?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          provider_id: string
          seeker_id: string
          rating: number
          comment?: string | null
          created_at?: string | null
        }
        Insert: {
          id?: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          provider_id: string
          seeker_id: string
          rating: number
          comment?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string
          reviewer_id?: string
          reviewee_id?: string
          provider_id?: string
          seeker_id?: string
          rating?: number
          comment?: string | null
          created_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean | null
          created_at?: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          is_read?: boolean | null
          created_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean | null
          data?: Json | null
          created_at?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean | null
          data?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean | null
          data?: Json | null
          created_at?: string | null
        }
      }
      admin_flags: {
        Row: {
          id: string
          type: 'user' | 'booking' | 'review'
          item_id: string
          reason: string
          status: 'pending' | 'resolved' | 'dismissed'
          created_by?: string | null
          resolved_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: {
          id?: string
          type: 'user' | 'booking' | 'review'
          item_id: string
          reason: string
          status: 'pending' | 'resolved' | 'dismissed'
          created_by?: string | null
          resolved_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          type?: 'user' | 'booking' | 'review'
          item_id?: string
          reason?: string
          status?: 'pending' | 'resolved' | 'dismissed'
          created_by?: string | null
          resolved_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      skill_swap_agreements: {
        Row: {
          id: string
          proposer_id: string
          recipient_id: string
          proposer_skill_id: string
          recipient_skill_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at?: string | null
          updated_at?: string | null
        }
        Insert: {
          id?: string
          proposer_id: string
          recipient_id: string
          proposer_skill_id: string
          recipient_skill_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          proposer_id?: string
          recipient_id?: string
          proposer_skill_id?: string
          recipient_skill_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string | null
          updated_at?: string | null
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