export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };

  public: {
    Tables: {
      appointments: {
        Row: {
          cpf: string | null;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          notes: string | null;
          phone: string;
          procedure_id: string;
          slot_id: string;
          status: string;
          updated_at: string;
        };

        Insert: {
          cpf?: string | null;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          notes?: string | null;
          phone: string;
          procedure_id: string;
          slot_id: string;
          status?: string;
          updated_at?: string;
        };

        Update: {
          cpf?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          notes?: string | null;
          phone?: string;
          procedure_id?: string;
          slot_id?: string;
          status?: string;
          updated_at?: string;
        };

        Relationships: [
          {
            foreignKeyName: "appointments_procedure_id_fkey";
            columns: ["procedure_id"];
            isOneToOne: false;
            referencedRelation: "procedures";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_slot_id_fkey";
            columns: ["slot_id"];
            isOneToOne: false;
            referencedRelation: "available_slots";
            referencedColumns: ["id"];
          },
        ];
      };

      available_slots: {
        Row: {
          created_at: string;
          id: string;
          procedure_id: string | null;
          slot_date: string;
          slot_time: string;
          status: string;
        };

        Insert: {
          created_at?: string;
          id?: string;
          procedure_id?: string | null;
          slot_date: string;
          slot_time: string;
          status?: string;
        };

        Update: {
          created_at?: string;
          id?: string;
          procedure_id?: string | null;
          slot_date?: string;
          slot_time?: string;
          status?: string;
        };

        Relationships: [
          {
            foreignKeyName: "available_slots_procedure_id_fkey";
            columns: ["procedure_id"];
            isOneToOne: false;
            referencedRelation: "procedures";
            referencedColumns: ["id"];
          },
        ];
      };

      procedures: {
        Row: {
          created_at: string;
          description: string;
          display_order: number;
          duration_minutes: number;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          price_cents: number | null;
          short_description: string;
          updated_at: string;
        };

        Insert: {
          created_at?: string;
          description?: string;
          display_order?: number;
          duration_minutes?: number;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          price_cents?: number | null;
          short_description?: string;
          updated_at?: string;
        };

        Update: {
          created_at?: string;
          description?: string;
          display_order?: number;
          duration_minutes?: number;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          price_cents?: number | null;
          short_description?: string;
          updated_at?: string;
        };

        Relationships: [];
      };

      profiles: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          role: string;
        };

        Insert: {
          created_at?: string;
          full_name: string;
          id: string;
          role?: string;
        };

        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          role?: string;
        };

        Relationships: [];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      create_appointment: {
        Args: {
          p_full_name: string;
          p_phone: string;
          p_procedure_id: string;
          p_slot_id: string;
        };

        Returns: string;
      };

      is_admin: {
        Args: never;
        Returns: boolean;
      };
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<
  Database,
  "__InternalSupabase"
>;

type DefaultSchema =
  DatabaseWithoutInternals[
    Extract<
      keyof Database,
      "public"
    >
  ];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (
        DefaultSchema["Tables"] &
        DefaultSchema["Views"]
      )
    | {
        schema: keyof DatabaseWithoutInternals;
      },

  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (
        DatabaseWithoutInternals[
          DefaultSchemaTableNameOrOptions["schema"]
        ]["Tables"] &
        DatabaseWithoutInternals[
          DefaultSchemaTableNameOrOptions["schema"]
        ]["Views"]
      )
    : never = never,
> =
  DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? (
        DatabaseWithoutInternals[
          DefaultSchemaTableNameOrOptions["schema"]
        ]["Tables"] &
        DatabaseWithoutInternals[
          DefaultSchemaTableNameOrOptions["schema"]
        ]["Views"]
      )[TableName] extends {
        Row: infer R;
      }
      ? R
      : never
    : DefaultSchemaTableNameOrOptions extends keyof (
          DefaultSchema["Tables"] &
          DefaultSchema["Views"]
        )
      ? (
          DefaultSchema["Tables"] &
          DefaultSchema["Views"]
        )[DefaultSchemaTableNameOrOptions] extends {
          Row: infer R;
        }
        ? R
        : never
      : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | {
        schema: keyof DatabaseWithoutInternals;
      },

  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[
        DefaultSchemaTableNameOrOptions["schema"]
      ]["Tables"]
    : never = never,
> =
  DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? DatabaseWithoutInternals[
        DefaultSchemaTableNameOrOptions["schema"]
      ]["Tables"][TableName] extends {
        Insert: infer I;
      }
      ? I
      : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][
          DefaultSchemaTableNameOrOptions
        ] extends {
          Insert: infer I;
        }
        ? I
        : never
      : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | {
        schema: keyof DatabaseWithoutInternals;
      },

  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[
        DefaultSchemaTableNameOrOptions["schema"]
      ]["Tables"]
    : never = never,
> =
  DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? DatabaseWithoutInternals[
        DefaultSchemaTableNameOrOptions["schema"]
      ]["Tables"][TableName] extends {
        Update: infer U;
      }
      ? U
      : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
      ? DefaultSchema["Tables"][
          DefaultSchemaTableNameOrOptions
        ] extends {
          Update: infer U;
        }
        ? U
        : never
      : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | {
        schema: keyof DatabaseWithoutInternals;
      },

  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[
        DefaultSchemaEnumNameOrOptions["schema"]
      ]["Enums"]
    : never = never,
> =
  DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? DatabaseWithoutInternals[
        DefaultSchemaEnumNameOrOptions["schema"]
      ]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][
          DefaultSchemaEnumNameOrOptions
        ]
      : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | {
        schema: keyof DatabaseWithoutInternals;
      },

  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[
        PublicCompositeTypeNameOrOptions["schema"]
      ]["CompositeTypes"]
    : never = never,
> =
  PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? DatabaseWithoutInternals[
        PublicCompositeTypeNameOrOptions["schema"]
      ]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
      ? DefaultSchema["CompositeTypes"][
          PublicCompositeTypeNameOrOptions
        ]
      : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

export type Procedure =
  Database["public"]["Tables"]["procedures"]["Row"];

export type AvailableSlot =
  Database["public"]["Tables"]["available_slots"]["Row"];

export type Appointment =
  Database["public"]["Tables"]["appointments"]["Row"];

export type Profile =
  Database["public"]["Tables"]["profiles"]["Row"];

export type ProcedureInsert =
  Database["public"]["Tables"]["procedures"]["Insert"];

export type ProcedureUpdate =
  Database["public"]["Tables"]["procedures"]["Update"];

export type AvailableSlotInsert =
  Database["public"]["Tables"]["available_slots"]["Insert"];

export type AvailableSlotUpdate =
  Database["public"]["Tables"]["available_slots"]["Update"];