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
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      event_sections: {
        Row: {
          available_count: number
          capacity: number
          created_at: string | null
          event_id: string
          id: string
          is_sold_out: boolean | null
          price: number
          section_id: string
          service_fee: number | null
          updated_at: string | null
        }
        Insert: {
          available_count: number
          capacity: number
          created_at?: string | null
          event_id: string
          id?: string
          is_sold_out?: boolean | null
          price: number
          section_id: string
          service_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          available_count?: number
          capacity?: number
          created_at?: string | null
          event_id?: string
          id?: string
          is_sold_out?: boolean | null
          price?: number
          section_id?: string
          service_fee?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sections_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          doors_open_time: string | null
          event_date: string
          event_time: string | null
          homepage_sections: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          performer_id: string | null
          price_from: number | null
          price_to: number | null
          title: string
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          doors_open_time?: string | null
          event_date: string
          event_time?: string | null
          homepage_sections?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          performer_id?: string | null
          price_from?: number | null
          price_to?: number | null
          title: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          doors_open_time?: string | null
          event_date?: string
          event_time?: string | null
          homepage_sections?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          performer_id?: string | null
          price_from?: number | null
          price_to?: number | null
          title?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_performer_id_fkey"
            columns: ["performer_id"]
            isOneToOne: false
            referencedRelation: "performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_config: {
        Row: {
          config_key: string
          config_value: Json | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value?: Json | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          order_id: string
          quantity: number
          row_name: string | null
          seat_numbers: string | null
          section_name: string
          service_fee: number | null
          ticket_inventory_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          order_id: string
          quantity: number
          row_name?: string | null
          seat_numbers?: string | null
          section_name: string
          service_fee?: number | null
          ticket_inventory_id?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          order_id?: string
          quantity?: number
          row_name?: string | null
          seat_numbers?: string | null
          section_name?: string
          service_fee?: number | null
          ticket_inventory_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_ticket_inventory_id_fkey"
            columns: ["ticket_inventory_id"]
            isOneToOne: false
            referencedRelation: "ticket_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: string | null
          billing_email: string | null
          billing_name: string | null
          created_at: string | null
          id: string
          order_number: string
          payment_intent_id: string | null
          payment_method: string | null
          service_fee: number | null
          status: string | null
          subtotal: number
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_address?: string | null
          billing_email?: string | null
          billing_name?: string | null
          created_at?: string | null
          id?: string
          order_number: string
          payment_intent_id?: string | null
          payment_method?: string | null
          service_fee?: number | null
          status?: string | null
          subtotal: number
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_address?: string | null
          billing_email?: string | null
          billing_name?: string | null
          created_at?: string | null
          id?: string
          order_number?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          service_fee?: number | null
          status?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performers: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seats: {
        Row: {
          coordinate_x: number | null
          coordinate_y: number | null
          created_at: string | null
          id: string
          is_accessible: boolean | null
          is_aisle: boolean | null
          row_name: string
          seat_number: number
          section_id: string
        }
        Insert: {
          coordinate_x?: number | null
          coordinate_y?: number | null
          created_at?: string | null
          id?: string
          is_accessible?: boolean | null
          is_aisle?: boolean | null
          row_name: string
          seat_number: number
          section_id: string
        }
        Update: {
          coordinate_x?: number | null
          coordinate_y?: number | null
          created_at?: string | null
          id?: string
          is_accessible?: boolean | null
          is_aisle?: boolean | null
          row_name?: string
          seat_number?: number
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seats_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          capacity: number | null
          created_at: string | null
          id: string
          is_general_admission: boolean | null
          name: string
          row_count: number | null
          seats_per_row: number | null
          section_type: string
          sort_order: number | null
          svg_path: string | null
          svg_transform: string | null
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_general_admission?: boolean | null
          name: string
          row_count?: number | null
          seats_per_row?: number | null
          section_type?: string
          sort_order?: number | null
          svg_path?: string | null
          svg_transform?: string | null
          updated_at?: string | null
          venue_id: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_general_admission?: boolean | null
          name?: string
          row_count?: number | null
          seats_per_row?: number | null
          section_type?: string
          sort_order?: number | null
          svg_path?: string | null
          svg_transform?: string | null
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      sell_requests: {
        Row: {
          asking_price: number
          city: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          event_date: string
          event_name: string
          id: string
          notes: string | null
          quantity: number
          row_name: string | null
          seat_numbers: string | null
          section: string
          status: string
          updated_at: string
          user_id: string | null
          venue_name: string
        }
        Insert: {
          asking_price: number
          city: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          event_date: string
          event_name: string
          id?: string
          notes?: string | null
          quantity?: number
          row_name?: string | null
          seat_numbers?: string | null
          section: string
          status?: string
          updated_at?: string
          user_id?: string | null
          venue_name: string
        }
        Update: {
          asking_price?: number
          city?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          event_date?: string
          event_name?: string
          id?: string
          notes?: string | null
          quantity?: number
          row_name?: string | null
          seat_numbers?: string | null
          section?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          venue_name?: string
        }
        Relationships: []
      }
      ticket_inventory: {
        Row: {
          created_at: string | null
          event_section_id: string
          has_clear_view: boolean | null
          id: string
          is_lowest_price: boolean | null
          is_resale: boolean | null
          notes: string | null
          price: number
          quantity: number
          reserved_until: string | null
          row_name: string | null
          seat_id: string | null
          seat_numbers: string | null
          seller_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_section_id: string
          has_clear_view?: boolean | null
          id?: string
          is_lowest_price?: boolean | null
          is_resale?: boolean | null
          notes?: string | null
          price: number
          quantity?: number
          reserved_until?: string | null
          row_name?: string | null
          seat_id?: string | null
          seat_numbers?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_section_id?: string
          has_clear_view?: boolean | null
          id?: string
          is_lowest_price?: boolean | null
          is_resale?: boolean | null
          notes?: string | null
          price?: number
          quantity?: number
          reserved_until?: string | null
          row_name?: string | null
          seat_id?: string | null
          seat_numbers?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_inventory_event_section_id_fkey"
            columns: ["event_section_id"]
            isOneToOne: false
            referencedRelation: "event_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_inventory_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          capacity: number | null
          city: string
          country: string | null
          created_at: string | null
          id: string
          map_viewbox: string | null
          name: string
          state: string | null
          svg_map: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city: string
          country?: string | null
          created_at?: string | null
          id?: string
          map_viewbox?: string | null
          name: string
          state?: string | null
          svg_map?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string
          country?: string | null
          created_at?: string | null
          id?: string
          map_viewbox?: string | null
          name?: string
          state?: string | null
          svg_map?: string | null
          updated_at?: string | null
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
      is_admin: { Args: never; Returns: boolean }
      is_moderator_or_admin: { Args: never; Returns: boolean }
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
