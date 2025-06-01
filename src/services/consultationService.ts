
import { supabase } from "@/integrations/supabase/client";
import { ConsultationFormData } from "@/components/consultation/types";
import { Database } from "@/integrations/supabase/types";

type DatabaseConsultation = Database['public']['Tables']['consultations']['Row'];
type DatabaseConsultationInsert = Database['public']['Tables']['consultations']['Insert'];

export interface ConsultationRecord {
  id: string;
  patient_name: string;
  consultation_type: string;
  status: 'in-progress' | 'pending-review' | 'completed' | 'generating-analysis';
  hda?: string;
  hipotese_diagnostica?: string;
  conduta?: string;
  exames_complementares?: string;
  reavaliacao_medica?: string;
  complemento_evolucao?: string;
  protocols?: any;
  comorbidades?: any;
  medicacoes?: any;
  alergias?: any;
  sinais_vitais?: any;
  exame_fisico?: any;
  recording_duration?: number;
  created_at: string;
  updated_at: string;
}

const mapDatabaseToConsultation = (dbRecord: DatabaseConsultation): ConsultationRecord => ({
  id: dbRecord.id,
  patient_name: dbRecord.patient_name,
  consultation_type: dbRecord.consultation_type,
  status: dbRecord.status as 'in-progress' | 'pending-review' | 'completed' | 'generating-analysis',
  hda: dbRecord.hda || undefined,
  hipotese_diagnostica: dbRecord.hipotese_diagnostica || undefined,
  conduta: dbRecord.conduta || undefined,
  exames_complementares: dbRecord.exames_complementares || undefined,
  reavaliacao_medica: dbRecord.reavaliacao_medica || undefined,
  complemento_evolucao: dbRecord.complemento_evolucao || undefined,
  protocols: dbRecord.protocols || undefined,
  comorbidades: dbRecord.comorbidades || undefined,
  medicacoes: dbRecord.medicacoes || undefined,
  alergias: dbRecord.alergias || undefined,
  sinais_vitais: dbRecord.sinais_vitais || undefined,
  exame_fisico: dbRecord.exame_fisico || undefined,
  recording_duration: dbRecord.recording_duration || undefined,
  created_at: dbRecord.created_at,
  updated_at: dbRecord.updated_at,
});

export const consultationService = {
  async getAllConsultations(): Promise<ConsultationRecord[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching consultations:', error);
      throw error;
    }

    return (data || []).map(mapDatabaseToConsultation);
  },

  async getConsultationById(id: string): Promise<ConsultationRecord | null> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching consultation:', error);
      throw error;
    }

    return data ? mapDatabaseToConsultation(data) : null;
  },

  async createConsultation(formData: ConsultationFormData, recordingDuration: number): Promise<ConsultationRecord> {
    const consultationData: DatabaseConsultationInsert = {
      patient_name: formData.nomePaciente,
      consultation_type: formData.consultationType,
      status: 'generating-analysis', // Mudança aqui: inicia com 'generating-analysis'
      hda: formData.hda,
      hipotese_diagnostica: formData.hipoteseDiagnostica,
      conduta: formData.conduta,
      exames_complementares: formData.examesComplementares,
      reavaliacao_medica: formData.reavaliacaoMedica,
      complemento_evolucao: formData.complementoEvolucao,
      protocols: formData.protocols as any,
      comorbidades: formData.comorbidades as any,
      medicacoes: formData.medicacoes as any,
      alergias: formData.alergias as any,
      sinais_vitais: formData.sinaisVitais as any,
      exame_fisico: formData.exameFisico as any,
      recording_duration: recordingDuration
    };

    const { data, error } = await supabase
      .from('consultations')
      .insert(consultationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }

    return mapDatabaseToConsultation(data);
  },

  async updateConsultationStatus(id: string, status: 'in-progress' | 'pending-review' | 'completed' | 'generating-analysis'): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating consultation status:', error);
      throw error;
    }
  },

  async updateConsultationWithAnalysis(id: string, analysisData: any): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .update({
        hda: analysisData['História da Doença Atual (HDA)'],
        hipotese_diagnostica: analysisData['Hipótese Diagnóstica'],
        conduta: analysisData['Conduta'],
        comorbidades: { tem: 'sim', especificar: analysisData['Comorbidades'] },
        medicacoes: { tem: 'sim', especificar: analysisData['Medicações de Uso Contínuo'] },
        alergias: { tem: 'sim', especificar: analysisData['Alergias'] },
        status: 'pending-review'
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating consultation with analysis:', error);
      throw error;
    }
  },

  async saveAudioRecording(consultationId: string, audioBlob: Blob): Promise<string | null> {
    try {
      const fileName = `${consultationId}_${Date.now()}.webm`;
      const filePath = `recordings/${fileName}`;

      // Upload audio to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('consultation-audio')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading audio:', uploadError);
        return null;
      }

      // Save audio metadata to database
      const { error: dbError } = await supabase
        .from('audio_recordings')
        .insert({
          consultation_id: consultationId,
          file_path: filePath,
          duration: 0, // Will be updated when we can calculate duration
          file_size: audioBlob.size,
          mime_type: 'audio/webm'
        });

      if (dbError) {
        console.error('Error saving audio metadata:', dbError);
        return null;
      }

      return filePath;
    } catch (error) {
      console.error('Error in saveAudioRecording:', error);
      return null;
    }
  }
};
