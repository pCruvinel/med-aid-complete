
import { supabase } from "@/integrations/supabase/client";
import { ConsultationFormData } from "@/components/consultation/types";

export interface ConsultationRecord {
  id: string;
  patient_name: string;
  consultation_type: string;
  status: 'in-progress' | 'pending-review' | 'completed';
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

    return data || [];
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

    return data;
  },

  async createConsultation(formData: ConsultationFormData, recordingDuration: number): Promise<ConsultationRecord> {
    const consultationData = {
      patient_name: formData.nomePaciente,
      consultation_type: formData.consultationType,
      status: 'pending-review' as const,
      hda: formData.hda,
      hipotese_diagnostica: formData.hipoteseDiagnostica,
      conduta: formData.conduta,
      exames_complementares: formData.examesComplementares,
      reavaliacao_medica: formData.reavaliacaoMedica,
      complemento_evolucao: formData.complementoEvolucao,
      protocols: formData.protocols,
      comorbidades: formData.comorbidades,
      medicacoes: formData.medicacoes,
      alergias: formData.alergias,
      sinais_vitais: formData.sinaisVitais,
      exame_fisico: formData.exameFisico,
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

    return data;
  },

  async updateConsultationStatus(id: string, status: 'in-progress' | 'pending-review' | 'completed'): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating consultation status:', error);
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
