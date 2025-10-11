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
      profiles: {
        Row: {
          id: string;
          full_name: string;
          date_of_birth: string;
          whatsapp_number: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          date_of_birth: string;
          whatsapp_number: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          date_of_birth?: string;
          whatsapp_number?: string;
          created_at?: string;
        };
      };
      masterclasses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          pdf_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          pdf_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          pdf_url?: string | null;
          created_at?: string;
        };
      };
      inscriptions: {
        Row: {
          id: string;
          profile_id: string;
          masterclass_id: string;
          validated: boolean;
          registration_date: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          masterclass_id: string;
          validated?: boolean;
          registration_date?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          masterclass_id?: string;
          validated?: boolean;
          registration_date?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          masterclass_id: string;
          question_text: string;
          choices: {
            A: string;
            B: string;
            C: string;
            D: string;
          };
          correct_choice: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          masterclass_id: string;
          question_text: string;
          choices: {
            A: string;
            B: string;
            C: string;
            D: string;
          };
          correct_choice: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          masterclass_id?: string;
          question_text?: string;
          choices?: {
            A: string;
            B: string;
            C: string;
            D: string;
          };
          correct_choice?: string;
          created_at?: string;
        };
      };
      tests: {
        Row: {
          id: string;
          inscription_id: string;
          type: 'PRE' | 'POST';
          score: number;
          max_score: number;
          responses: unknown;
          taken_at: string;
        };
        Insert: {
          id?: string;
          inscription_id: string;
          type: 'PRE' | 'POST';
          score: number;
          max_score?: number;
          responses: unknown;
          taken_at?: string;
        };
        Update: {
          id?: string;
          inscription_id?: string;
          type?: 'PRE' | 'POST';
          score?: number;
          max_score?: number;
          responses?: unknown;
          taken_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'tuteur';
          assigned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'admin' | 'tuteur';
          assigned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'tuteur';
          assigned_at?: string;
        };
      };
      masterclass_sessions: {
        Row: {
          id: string;
          masterclass_id: string;
          session_date: string;
          max_participants: number;
          current_participants: number;
          is_full: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          masterclass_id: string;
          session_date: string;
          max_participants?: number;
          current_participants?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          masterclass_id?: string;
          session_date?: string;
          max_participants?: number;
          current_participants?: number;
          created_at?: string;
        };
      };
      session_bookings: {
        Row: {
          id: string;
          inscription_id: string;
          session_id: string;
          booked_at: string;
        };
        Insert: {
          id?: string;
          inscription_id: string;
          session_id: string;
          booked_at?: string;
        };
        Update: {
          id?: string;
          inscription_id?: string;
          session_id?: string;
          booked_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Inscription = Database['public']['Tables']['inscriptions']['Row']
export type Masterclass = Database['public']['Tables']['masterclasses']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Test = Database['public']['Tables']['tests']['Row']
export type UserRole = Database['public']['Tables']['user_roles']['Row']

export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertInscription = Database['public']['Tables']['inscriptions']['Insert']
export type InsertMasterclass = Database['public']['Tables']['masterclasses']['Insert']
export type InsertQuestion = Database['public']['Tables']['questions']['Insert']
export type InsertTest = Database['public']['Tables']['tests']['Insert']
export type InsertUserRole = Database['public']['Tables']['user_roles']['Insert']
