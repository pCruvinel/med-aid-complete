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
      consultations: {
        Row: {
          id: string
          patient_name: string | null
          consultation_type: string | null
          status: string | null
          audio_url: string | null
          audio_duration: number | null
          created_at: string | null
          updated_at: string | null
          protocols: Json | null
          hda: string | null
          comorbidades: string | null
          medicacoes: string | null
          alergias: string | null
          sinais_vitais: Json | null
          exame_fisico: Json | null
          hipotese_diagnostica: string | null
          conduta: string | null
          exames_complementares: string | null
          reavaliacao_medica: string | null
          complemento_evolucao: string | null
        }
        Insert: {
          id?: string
          patient_name?: string | null
          consultation_type?: string | null
          status?: string | null
          audio_url?: string | null
          audio_duration?: number | null
          created_at?: string | null
          updated_at?: string | null
          protocols?: Json | null
          hda?: string | null
          comorbidades?: string | null
          medicacoes?: string | null
          alergias?: string | null
          sinais_vitais?: Json | null
          exame_fisico?: Json | null
          hipotese_diagnostica?: string | null
          conduta?: string | null
          exames_complementares?: string | null
          reavaliacao_medica?: string | null
          complemento_evolucao?: string | null
        }
        Update: {
          id?: string
          patient_name?: string | null
          consultation_type?: string | null
          status?: string | null
          audio_url?: string | null
          audio_duration?: number | null
          created_at?: string | null
          updated_at?: string | null
          protocols?: Json | null
          hda?: string | null
          comorbidades?: string | null
          medicacoes?: string | null
          alergias?: string | null
          sinais_vitais?: Json | null
          exame_fisico?: Json | null
          hipotese_diagnostica?: string | null
          conduta?: string | null
          exames_complementares?: string | null
          reavaliacao_medica?: string | null
          complemento_evolucao?: string | null
        }
        Relationships: []
      }
      ai_analysis: {
        Row: {
          id: string
          consultation_id: string
          hda_ai: string | null
          comorbidades_ai: string | null
          medicacoes_ai: string | null
          alergias_ai: string | null
          hipotese_diagnostica_ai: string | null
          conduta_ai: string | null
          processing_status: string | null
          error_message: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          consultation_id: string
          hda_ai?: string | null
          comorbidades_ai?: string | null
          medicacoes_ai?: string | null
          alergias_ai?: string | null
          hipotese_diagnostica_ai?: string | null
          conduta_ai?: string | null
          processing_status?: string | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          consultation_id?: string
          hda_ai?: string | null
          comorbidades_ai?: string | null
          medicacoes_ai?: string | null
          alergias_ai?: string | null
          hipotese_diagnostica_ai?: string | null
          conduta_ai?: string | null
          processing_status?: string | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_consultation_id_fkey"
            columns: ["consultation_id"]
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          }
        ]
      }
      consultation_documents: {
        Row: {
          id: string
          consultation_id: string
          file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          consultation_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          consultation_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_documents_consultation_id_fkey"
            columns: ["consultation_id"]
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          }
        ]
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