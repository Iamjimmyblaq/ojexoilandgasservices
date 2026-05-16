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
      contact_messages: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          email: string
          experience_years: number | null
          full_name: string
          id: string
          job_id: string | null
          phone: string | null
          position_applied: string
          resume_url: string | null
          status: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          email: string
          experience_years?: number | null
          full_name: string
          id?: string
          job_id?: string | null
          phone?: string | null
          position_applied: string
          resume_url?: string | null
          status?: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          email?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          job_id?: string | null
          phone?: string | null
          position_applied?: string
          resume_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string
          id: string
          job_type: string
          location: string
          requirements: string | null
          title: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          description: string
          id?: string
          job_type?: string
          location: string
          requirements?: string | null
          title: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          id?: string
          job_type?: string
          location?: string
          requirements?: string | null
          title?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      procurement_activity: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          request_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          request_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "procurement_activity_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          request_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "procurement_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_requests: {
        Row: {
          assigned_to: string | null
          assigned_vendor_id: string | null
          budget_estimate: number | null
          category: string
          created_at: string
          created_by: string
          currency: string | null
          delivery_location: string | null
          description: string | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["procurement_priority"]
          quantity: string | null
          reference: string
          required_by: string | null
          status: Database["public"]["Enums"]["procurement_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_vendor_id?: string | null
          budget_estimate?: number | null
          category: string
          created_at?: string
          created_by: string
          currency?: string | null
          delivery_location?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["procurement_priority"]
          quantity?: string | null
          reference?: string
          required_by?: string | null
          status?: Database["public"]["Enums"]["procurement_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          assigned_vendor_id?: string | null
          budget_estimate?: number | null
          category?: string
          created_at?: string
          created_by?: string
          currency?: string | null
          delivery_location?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["procurement_priority"]
          quantity?: string | null
          reference?: string
          required_by?: string | null
          status?: Database["public"]["Enums"]["procurement_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procurement_requests_assigned_vendor_id_fkey"
            columns: ["assigned_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          brochure_url: string | null
          category: string
          created_at: string
          description: string | null
          featured: boolean
          gallery_urls: string[]
          id: string
          image_url: string | null
          in_stock: boolean
          manufacturer: string | null
          name: string
          short_description: string | null
          sku: string | null
          slug: string
          specifications: Json | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          brochure_url?: string | null
          category: string
          created_at?: string
          description?: string | null
          featured?: boolean
          gallery_urls?: string[]
          id?: string
          image_url?: string | null
          in_stock?: boolean
          manufacturer?: string | null
          name: string
          short_description?: string | null
          sku?: string | null
          slug: string
          specifications?: Json | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          brochure_url?: string | null
          category?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          gallery_urls?: string[]
          id?: string
          image_url?: string | null
          in_stock?: boolean
          manufacturer?: string | null
          name?: string
          short_description?: string | null
          sku?: string | null
          slug?: string
          specifications?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          budget: string | null
          company_name: string
          contact_name: string
          created_at: string
          delivery_location: string | null
          email: string
          id: string
          notes: string | null
          phone: string | null
          product_service: string
          quantity: string | null
          status: string
          timeline: string | null
        }
        Insert: {
          budget?: string | null
          company_name: string
          contact_name: string
          created_at?: string
          delivery_location?: string | null
          email: string
          id?: string
          notes?: string | null
          phone?: string | null
          product_service: string
          quantity?: string | null
          status?: string
          timeline?: string | null
        }
        Update: {
          budget?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string
          delivery_location?: string | null
          email?: string
          id?: string
          notes?: string | null
          phone?: string | null
          product_service?: string
          quantity?: string | null
          status?: string
          timeline?: string | null
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
      vendor_registrations: {
        Row: {
          capabilities: string | null
          category: string
          company_name: string
          contact_name: string
          country: string | null
          created_at: string
          email: string
          id: string
          phone: string | null
          website: string | null
        }
        Insert: {
          capabilities?: string | null
          category: string
          company_name: string
          contact_name: string
          country?: string | null
          created_at?: string
          email: string
          id?: string
          phone?: string | null
          website?: string | null
        }
        Update: {
          capabilities?: string | null
          category?: string
          company_name?: string
          contact_name?: string
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
          website?: string | null
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
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
      procurement_priority: "low" | "normal" | "high" | "urgent"
      procurement_status:
        | "draft"
        | "submitted"
        | "sourcing"
        | "quoted"
        | "approved"
        | "ordered"
        | "delivered"
        | "closed"
        | "cancelled"
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
      app_role: ["admin", "manager", "user"],
      procurement_priority: ["low", "normal", "high", "urgent"],
      procurement_status: [
        "draft",
        "submitted",
        "sourcing",
        "quoted",
        "approved",
        "ordered",
        "delivered",
        "closed",
        "cancelled",
      ],
    },
  },
} as const
