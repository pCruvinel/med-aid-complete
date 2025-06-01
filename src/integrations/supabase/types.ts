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
      audio_recordings: {
        Row: {
          consultation_id: string | null
          created_at: string
          duration: number | null
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          duration?: number | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          duration?: number | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_recordings_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          alergias: Json | null
          alergias_original: Json | null
          comorbidades: Json | null
          comorbidades_original: Json | null
          complemento_evolucao: string | null
          conduta: string | null
          conduta_original: string | null
          consultation_type: string
          created_at: string
          exame_fisico: Json | null
          exames_complementares: string | null
          hda: string | null
          hda_original: string | null
          hipotese_diagnostica: string | null
          hipotese_diagnostica_original: string | null
          id: string
          medicacoes: Json | null
          medicacoes_original: Json | null
          patient_name: string
          protocols: Json | null
          reavaliacao_medica: string | null
          recording_duration: number | null
          sinais_vitais: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          alergias?: Json | null
          alergias_original?: Json | null
          comorbidades?: Json | null
          comorbidades_original?: Json | null
          complemento_evolucao?: string | null
          conduta?: string | null
          conduta_original?: string | null
          consultation_type: string
          created_at?: string
          exame_fisico?: Json | null
          exames_complementares?: string | null
          hda?: string | null
          hda_original?: string | null
          hipotese_diagnostica?: string | null
          hipotese_diagnostica_original?: string | null
          id?: string
          medicacoes?: Json | null
          medicacoes_original?: Json | null
          patient_name: string
          protocols?: Json | null
          reavaliacao_medica?: string | null
          recording_duration?: number | null
          sinais_vitais?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          alergias?: Json | null
          alergias_original?: Json | null
          comorbidades?: Json | null
          comorbidades_original?: Json | null
          complemento_evolucao?: string | null
          conduta?: string | null
          conduta_original?: string | null
          consultation_type?: string
          created_at?: string
          exame_fisico?: Json | null
          exames_complementares?: string | null
          hda?: string | null
          hda_original?: string | null
          hipotese_diagnostica?: string | null
          hipotese_diagnostica_original?: string | null
          id?: string
          medicacoes?: Json | null
          medicacoes_original?: Json | null
          patient_name?: string
          protocols?: Json | null
          reavaliacao_medica?: string | null
          recording_duration?: number | null
          sinais_vitais?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
