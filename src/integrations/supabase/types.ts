export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      child_attendance: {
        Row: {
          child_id: string
          created_at: string
          date: string
          drive_id: string | null
          id: string
          location: string
          user_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          date?: string
          drive_id?: string | null
          id?: string
          location: string
          user_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          date?: string
          drive_id?: string | null
          id?: string
          location?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_attendance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_attendance_drive_id_fkey"
            columns: ["drive_id"]
            isOneToOne: false
            referencedRelation: "drives"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          aadhaar_number: string | null
          age_group: number
          attendance_count: number | null
          created_at: string
          father_name: string
          id: string
          location: string | null
          mother_name: string
          name: string
          photo_url: string | null
          school_name: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aadhaar_number?: string | null
          age_group: number
          attendance_count?: number | null
          created_at?: string
          father_name: string
          id?: string
          location?: string | null
          mother_name: string
          name: string
          photo_url?: string | null
          school_name?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aadhaar_number?: string | null
          age_group?: number
          attendance_count?: number | null
          created_at?: string
          father_name?: string
          id?: string
          location?: string | null
          mother_name?: string
          name?: string
          photo_url?: string | null
          school_name?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      drives: {
        Row: {
          children_group_photo_url: string | null
          combined_group_photo_url: string | null
          created_at: string
          date: string
          id: string
          items_distributed: Json | null
          location: string
          name: string
          robin_group_photo_url: string | null
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          children_group_photo_url?: string | null
          combined_group_photo_url?: string | null
          created_at?: string
          date: string
          id?: string
          items_distributed?: Json | null
          location: string
          name: string
          robin_group_photo_url?: string | null
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          children_group_photo_url?: string | null
          combined_group_photo_url?: string | null
          created_at?: string
          date?: string
          id?: string
          items_distributed?: Json | null
          location?: string
          name?: string
          robin_group_photo_url?: string | null
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      educational_content: {
        Row: {
          age_group: number
          content: string
          content_type: string
          created_at: string
          id: string
          subject: string
          user_id: string
        }
        Insert: {
          age_group: number
          content: string
          content_type: string
          created_at?: string
          id?: string
          subject: string
          user_id: string
        }
        Update: {
          age_group?: number
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      robin_drives: {
        Row: {
          attendance_marked: boolean | null
          commute_method: string | null
          contribution_message: string | null
          created_at: string
          date: string
          drive_id: string | null
          id: string
          items_brought: Json | null
          location: string
          robin_id: string
          user_id: string
        }
        Insert: {
          attendance_marked?: boolean | null
          commute_method?: string | null
          contribution_message?: string | null
          created_at?: string
          date?: string
          drive_id?: string | null
          id?: string
          items_brought?: Json | null
          location: string
          robin_id: string
          user_id: string
        }
        Update: {
          attendance_marked?: boolean | null
          commute_method?: string | null
          contribution_message?: string | null
          created_at?: string
          date?: string
          drive_id?: string | null
          id?: string
          items_brought?: Json | null
          location?: string
          robin_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "robin_drives_drive_id_fkey"
            columns: ["drive_id"]
            isOneToOne: false
            referencedRelation: "drives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "robin_drives_robin_id_fkey"
            columns: ["robin_id"]
            isOneToOne: false
            referencedRelation: "robins"
            referencedColumns: ["id"]
          },
        ]
      }
      robin_unavailability: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          robin_id: string
          unavailable_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          robin_id: string
          unavailable_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          robin_id?: string
          unavailable_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "robin_unavailability_robin_id_fkey"
            columns: ["robin_id"]
            isOneToOne: false
            referencedRelation: "robins"
            referencedColumns: ["id"]
          },
        ]
      }
      robins: {
        Row: {
          assigned_date: string
          assigned_location: string
          created_at: string
          drive_count: number | null
          home_location: string | null
          id: string
          name: string
          photo_url: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_date: string
          assigned_location: string
          created_at?: string
          drive_count?: number | null
          home_location?: string | null
          id?: string
          name: string
          photo_url?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_date?: string
          assigned_location?: string
          created_at?: string
          drive_count?: number | null
          home_location?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      app_role: "admin" | "robin" | "child"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "robin", "child"],
    },
  },
} as const
