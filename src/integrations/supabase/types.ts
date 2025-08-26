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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      amenities: {
        Row: {
          advance_booking_days: number | null
          booking_fee: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          max_hours: number | null
          name: string
          society_id: string
          updated_at: string
        }
        Insert: {
          advance_booking_days?: number | null
          booking_fee?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_hours?: number | null
          name: string
          society_id: string
          updated_at?: string
        }
        Update: {
          advance_booking_days?: number | null
          booking_fee?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_hours?: number | null
          name?: string
          society_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "amenities_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      amenity_bookings: {
        Row: {
          amenity_id: string
          booking_date: string
          created_at: string
          end_time: string
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          profile_id: string
          purpose: string | null
          start_time: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amenity_id: string
          booking_date: string
          created_at?: string
          end_time: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          profile_id: string
          purpose?: string | null
          start_time: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amenity_id?: string
          booking_date?: string
          created_at?: string
          end_time?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          profile_id?: string
          purpose?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "amenity_bookings_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amenity_bookings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          attachment_urls: string[] | null
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_urgent: boolean | null
          society_id: string
          title: string
          updated_at: string
        }
        Insert: {
          attachment_urls?: string[] | null
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_urgent?: boolean | null
          society_id: string
          title: string
          updated_at?: string
        }
        Update: {
          attachment_urls?: string[] | null
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_urgent?: boolean | null
          society_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          attachment_urls: string[] | null
          category: string
          created_at: string
          description: string
          id: string
          priority: string | null
          profile_id: string
          resolution_notes: string | null
          society_id: string
          status: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachment_urls?: string[] | null
          category: string
          created_at?: string
          description: string
          id?: string
          priority?: string | null
          profile_id: string
          resolution_notes?: string | null
          society_id: string
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachment_urls?: string[] | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string | null
          profile_id?: string
          resolution_notes?: string | null
          society_id?: string
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          guests_count: number | null
          id: string
          profile_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          guests_count?: number | null
          id?: string
          profile_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          guests_count?: number | null
          id?: string
          profile_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          id: string
          location: string | null
          max_attendees: number | null
          requires_rsvp: boolean | null
          society_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          id?: string
          location?: string | null
          max_attendees?: number | null
          requires_rsvp?: boolean | null
          society_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          id?: string
          location?: string | null
          max_attendees?: number | null
          requires_rsvp?: boolean | null
          society_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          created_at: string
          created_by: string
          description: string | null
          expense_date: string
          id: string
          receipt_url: string | null
          society_id: string
          title: string
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category: string
          created_at?: string
          created_by: string
          description?: string | null
          expense_date: string
          id?: string
          receipt_url?: string | null
          society_id: string
          title: string
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          expense_date?: string
          id?: string
          receipt_url?: string | null
          society_id?: string
          title?: string
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_fees: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string
          id: string
          payment_date: string | null
          payment_method: string | null
          profile_id: string
          society_id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          profile_id: string
          society_id: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          profile_id?: string
          society_id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_fees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_fees_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          emergency_contact: string | null
          family_members: string[] | null
          full_name: string
          id: string
          is_active: boolean | null
          is_owner: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          society_id: string | null
          unit_number: string | null
          updated_at: string
          user_id: string
          vehicle_details: string | null
        }
        Insert: {
          created_at?: string
          email: string
          emergency_contact?: string | null
          family_members?: string[] | null
          full_name: string
          id?: string
          is_active?: boolean | null
          is_owner?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          society_id?: string | null
          unit_number?: string | null
          updated_at?: string
          user_id: string
          vehicle_details?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          emergency_contact?: string | null
          family_members?: string[] | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_owner?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          society_id?: string | null
          unit_number?: string | null
          updated_at?: string
          user_id?: string
          vehicle_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      societies: {
        Row: {
          address: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          registration_number: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          registration_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          created_at: string
          entry_time: string | null
          exit_time: string | null
          host_profile_id: string
          id: string
          purpose: string
          security_notes: string | null
          society_id: string
          status: Database["public"]["Enums"]["visitor_status"] | null
          updated_at: string
          visit_date: string
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          created_at?: string
          entry_time?: string | null
          exit_time?: string | null
          host_profile_id: string
          id?: string
          purpose: string
          security_notes?: string | null
          society_id: string
          status?: Database["public"]["Enums"]["visitor_status"] | null
          updated_at?: string
          visit_date: string
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          created_at?: string
          entry_time?: string | null
          exit_time?: string | null
          host_profile_id?: string
          id?: string
          purpose?: string
          security_notes?: string | null
          society_id?: string
          status?: Database["public"]["Enums"]["visitor_status"] | null
          updated_at?: string
          visit_date?: string
          visitor_name?: string
          visitor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitors_host_profile_id_fkey"
            columns: ["host_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitors_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_in_society: {
        Args: { target_society: string }
        Returns: boolean
      }
    }
    Enums: {
      complaint_status: "open" | "in_progress" | "resolved" | "closed"
      payment_status: "pending" | "paid" | "overdue" | "cancelled"
      user_role:
        | "super_admin"
        | "society_admin"
        | "committee_member"
        | "resident"
        | "guest"
      visitor_status:
        | "pending"
        | "approved"
        | "checked_in"
        | "checked_out"
        | "rejected"
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
      complaint_status: ["open", "in_progress", "resolved", "closed"],
      payment_status: ["pending", "paid", "overdue", "cancelled"],
      user_role: [
        "super_admin",
        "society_admin",
        "committee_member",
        "resident",
        "guest",
      ],
      visitor_status: [
        "pending",
        "approved",
        "checked_in",
        "checked_out",
        "rejected",
      ],
    },
  },
} as const
