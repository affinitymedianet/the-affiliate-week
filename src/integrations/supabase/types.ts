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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          detail: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          detail?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          category: string
          coupon_code: string | null
          created_at: string
          deal_type: string
          deal_url: string
          description: string
          discount_label: string | null
          exclusive: boolean
          expires_on: string | null
          featured: boolean
          id: string
          publish_at: string | null
          published: boolean
          starts_on: string
          summary: string
          title: string
          updated_at: string
          vendor: string
        }
        Insert: {
          category?: string
          coupon_code?: string | null
          created_at?: string
          deal_type?: string
          deal_url: string
          description: string
          discount_label?: string | null
          exclusive?: boolean
          expires_on?: string | null
          featured?: boolean
          id?: string
          publish_at?: string | null
          published?: boolean
          starts_on?: string
          summary: string
          title: string
          updated_at?: string
          vendor: string
        }
        Update: {
          category?: string
          coupon_code?: string | null
          created_at?: string
          deal_type?: string
          deal_url?: string
          description?: string
          discount_label?: string | null
          exclusive?: boolean
          expires_on?: string | null
          featured?: boolean
          id?: string
          publish_at?: string | null
          published?: boolean
          starts_on?: string
          summary?: string
          title?: string
          updated_at?: string
          vendor?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string
          event_url: string | null
          featured: boolean
          format: string
          id: string
          image_key: string
          image_url: string | null
          location: string
          name: string
          price: string
          publish_at: string | null
          published: boolean
          slug: string
          starts_on: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          event_url?: string | null
          featured?: boolean
          format?: string
          id?: string
          image_key?: string
          image_url?: string | null
          location: string
          name: string
          price?: string
          publish_at?: string | null
          published?: boolean
          slug: string
          starts_on: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          event_url?: string | null
          featured?: boolean
          format?: string
          id?: string
          image_key?: string
          image_url?: string | null
          location?: string
          name?: string
          price?: string
          publish_at?: string | null
          published?: boolean
          slug?: string
          starts_on?: string
          updated_at?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          cover_url: string | null
          created_at: string
          id: string
          issue_date: string
          number: number
          publish_at: string | null
          published: boolean
          reading_time: string
          sections: Json
          slug: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          id?: string
          issue_date?: string
          number: number
          publish_at?: string | null
          published?: boolean
          reading_time?: string
          sections?: Json
          slug: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          id?: string
          issue_date?: string
          number?: number
          publish_at?: string | null
          published?: boolean
          reading_time?: string
          sections?: Json
          slug?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          apply_url: string
          company: string
          created_at: string
          description: string
          employment_type: string
          expires_on: string | null
          featured: boolean
          id: string
          location: string
          posted_on: string
          publish_at: string | null
          published: boolean
          salary_range: string | null
          summary: string
          title: string
          updated_at: string
          work_type: string
        }
        Insert: {
          apply_url: string
          company: string
          created_at?: string
          description: string
          employment_type?: string
          expires_on?: string | null
          featured?: boolean
          id?: string
          location: string
          posted_on?: string
          publish_at?: string | null
          published?: boolean
          salary_range?: string | null
          summary: string
          title: string
          updated_at?: string
          work_type?: string
        }
        Update: {
          apply_url?: string
          company?: string
          created_at?: string
          description?: string
          employment_type?: string
          expires_on?: string | null
          featured?: boolean
          id?: string
          location?: string
          posted_on?: string
          publish_at?: string | null
          published?: boolean
          salary_range?: string | null
          summary?: string
          title?: string
          updated_at?: string
          work_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          analytics_id: string | null
          contact_email: string
          double_opt_in: boolean
          favicon_url: string | null
          id: boolean
          logo_dark_url: string | null
          logo_url: string | null
          newsletter_list_id: string | null
          newsletter_provider: string
          privacy_content: string
          privacy_updated_at: string | null
          search_console_tag: string | null
          seo_description: string
          seo_share_image_url: string | null
          seo_title_template: string
          site_name: string
          social_links: Json
          submit_url: string
          tagline: string
          terms_content: string
          terms_updated_at: string | null
          updated_at: string
          welcome_email: boolean
        }
        Insert: {
          analytics_id?: string | null
          contact_email?: string
          double_opt_in?: boolean
          favicon_url?: string | null
          id?: boolean
          logo_dark_url?: string | null
          logo_url?: string | null
          newsletter_list_id?: string | null
          newsletter_provider?: string
          privacy_content?: string
          privacy_updated_at?: string | null
          search_console_tag?: string | null
          seo_description?: string
          seo_share_image_url?: string | null
          seo_title_template?: string
          site_name?: string
          social_links?: Json
          submit_url?: string
          tagline?: string
          terms_content?: string
          terms_updated_at?: string | null
          updated_at?: string
          welcome_email?: boolean
        }
        Update: {
          analytics_id?: string | null
          contact_email?: string
          double_opt_in?: boolean
          favicon_url?: string | null
          id?: boolean
          logo_dark_url?: string | null
          logo_url?: string | null
          newsletter_list_id?: string | null
          newsletter_provider?: string
          privacy_content?: string
          privacy_updated_at?: string | null
          search_console_tag?: string | null
          seo_description?: string
          seo_share_image_url?: string | null
          seo_title_template?: string
          site_name?: string
          social_links?: Json
          submit_url?: string
          tagline?: string
          terms_content?: string
          terms_updated_at?: string | null
          updated_at?: string
          welcome_email?: boolean
        }
        Relationships: []
      }
      sponsor_enquiries: {
        Row: {
          admin_notes: string | null
          budget: string | null
          company: string
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          status: string
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          budget?: string | null
          company: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          status?: string
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          budget?: string | null
          company?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          status?: string
          website?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          details: string | null
          happens_on: string | null
          id: string
          kind: string
          location: string | null
          organisation: string | null
          status: string
          submitter_email: string
          submitter_name: string
          title: string
          url: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          happens_on?: string | null
          id?: string
          kind: string
          location?: string | null
          organisation?: string | null
          status?: string
          submitter_email: string
          submitter_name: string
          title: string
          url?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          details?: string | null
          happens_on?: string | null
          id?: string
          kind?: string
          location?: string | null
          organisation?: string | null
          status?: string
          submitter_email?: string
          submitter_name?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          status: string
          unsubscribe_token: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          status?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          status?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
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
      app_role: ["admin", "editor"],
    },
  },
} as const
