export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_daily: {
        Row: {
          active_users: number | null
          created_at: string
          date: string
          id: string
          new_users: number | null
          pro_conversions: number | null
          total_chats: number | null
          total_images_generated: number | null
          total_messages: number | null
          total_voice_seconds: number | null
          updated_at: string
        }
        Insert: {
          active_users?: number | null
          created_at?: string
          date?: string
          id?: string
          new_users?: number | null
          pro_conversions?: number | null
          total_chats?: number | null
          total_images_generated?: number | null
          total_messages?: number | null
          total_voice_seconds?: number | null
          updated_at?: string
        }
        Update: {
          active_users?: number | null
          created_at?: string
          date?: string
          id?: string
          new_users?: number | null
          pro_conversions?: number | null
          total_chats?: number | null
          total_images_generated?: number | null
          total_messages?: number | null
          total_voice_seconds?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          mode: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_progress: {
        Row: {
          created_at: string
          ease_factor: number
          flashcard_id: string
          id: string
          interval_days: number
          last_reviewed_at: string | null
          next_review_date: string
          repetitions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ease_factor?: number
          flashcard_id: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_date?: string
          repetitions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ease_factor?: number
          flashcard_id?: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_date?: string
          repetitions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          category: string
          created_at: string
          front: string
          id: string
          user_id: string
        }
        Insert: {
          back: string
          category?: string
          created_at?: string
          front: string
          id?: string
          user_id: string
        }
        Update: {
          back?: string
          category?: string
          created_at?: string
          front?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      image_generation_usage: {
        Row: {
          generated_at: string
          id: string
          image_url: string | null
          prompt: string | null
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          image_url?: string | null
          prompt?: string | null
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          image_url?: string | null
          prompt?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mistake_patterns: {
        Row: {
          context: string | null
          correction: string | null
          detected_at: string
          frequency: number | null
          id: string
          mistake_text: string
          mistake_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: string | null
          correction?: string | null
          detected_at?: string
          frequency?: number | null
          id?: string
          mistake_text: string
          mistake_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: string | null
          correction?: string | null
          detected_at?: string
          frequency?: number | null
          id?: string
          mistake_text?: string
          mistake_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_checkins: {
        Row: {
          created_at: string
          energy_level: number | null
          id: string
          mood: string
          mood_score: number
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          id?: string
          mood: string
          mood_score: number
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: string
          mood_score?: number
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_verifications: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_method: string | null
          status: string | null
          transaction_id: string
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_id: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_id?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_scores: {
        Row: {
          category: string
          created_at: string
          difficulty: string | null
          id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          difficulty?: string | null
          id?: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          difficulty?: string | null
          id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      session_emotions: {
        Row: {
          confidence_level: number | null
          detected_emotion: string | null
          energy_level: number | null
          id: string
          message_text: string | null
          session_type: string
          timestamp: string
          user_id: string
        }
        Insert: {
          confidence_level?: number | null
          detected_emotion?: string | null
          energy_level?: number | null
          id?: string
          message_text?: string | null
          session_type: string
          timestamp?: string
          user_id: string
        }
        Update: {
          confidence_level?: number | null
          detected_emotion?: string | null
          energy_level?: number | null
          id?: string
          message_text?: string | null
          session_type?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      study_buddies: {
        Row: {
          compatibility_score: number | null
          created_at: string
          id: string
          match_reason: string | null
          partner_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string
          id?: string
          match_reason?: string | null
          partner_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string
          id?: string
          match_reason?: string | null
          partner_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_notes: {
        Row: {
          class_level: string | null
          content: string
          created_at: string
          id: string
          is_formula: boolean | null
          source_message_id: string | null
          subject: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class_level?: string | null
          content: string
          created_at?: string
          id?: string
          is_formula?: boolean | null
          source_message_id?: string | null
          subject?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class_level?: string | null
          content?: string
          created_at?: string
          id?: string
          is_formula?: boolean | null
          source_message_id?: string | null
          subject?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          ai_personality: string | null
          average_session_minutes: number | null
          communication_style: string | null
          conversation_depth: number | null
          created_at: string
          current_focus: string | null
          detected_mood_preference: string | null
          emotional_openness: number | null
          encouragement_level: string | null
          energy_level: number | null
          expertise_level: number | null
          flirt_level: number | null
          humor_appreciation: number | null
          id: string
          interests: Json | null
          learning_style: string | null
          mood_tendency: string | null
          preferred_pace: string | null
          strong_areas: Json | null
          study_goals: Json | null
          total_sessions: number | null
          updated_at: string
          user_id: string
          weak_areas: Json | null
        }
        Insert: {
          ai_personality?: string | null
          average_session_minutes?: number | null
          communication_style?: string | null
          conversation_depth?: number | null
          created_at?: string
          current_focus?: string | null
          detected_mood_preference?: string | null
          emotional_openness?: number | null
          encouragement_level?: string | null
          energy_level?: number | null
          expertise_level?: number | null
          flirt_level?: number | null
          humor_appreciation?: number | null
          id?: string
          interests?: Json | null
          learning_style?: string | null
          mood_tendency?: string | null
          preferred_pace?: string | null
          strong_areas?: Json | null
          study_goals?: Json | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
          weak_areas?: Json | null
        }
        Update: {
          ai_personality?: string | null
          average_session_minutes?: number | null
          communication_style?: string | null
          conversation_depth?: number | null
          created_at?: string
          current_focus?: string | null
          detected_mood_preference?: string | null
          emotional_openness?: number | null
          encouragement_level?: string | null
          energy_level?: number | null
          expertise_level?: number | null
          flirt_level?: number | null
          humor_appreciation?: number | null
          id?: string
          interests?: Json | null
          learning_style?: string | null
          mood_tendency?: string | null
          preferred_pace?: string | null
          strong_areas?: Json | null
          study_goals?: Json | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
          weak_areas?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          created_at: string
          id: string
          level: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_session_usage: {
        Row: {
          created_at: string
          id: string
          session_date: string
          total_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_date?: string
          total_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_date?: string
          total_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_sessions: {
        Row: {
          ai_feedback: string | null
          band_score_estimate: number | null
          created_at: string
          duration_seconds: number
          emotion_summary: Json | null
          id: string
          messages: Json
          session_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          band_score_estimate?: number | null
          created_at?: string
          duration_seconds?: number
          emotion_summary?: Json | null
          id?: string
          messages?: Json
          session_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          band_score_estimate?: number | null
          created_at?: string
          duration_seconds?: number
          emotion_summary?: Json | null
          id?: string
          messages?: Json
          session_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_admin_by_email: { Args: { _email: string }; Returns: undefined }
      get_user_email: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
