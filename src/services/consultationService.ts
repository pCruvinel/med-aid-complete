import { supabase } from "@/integrations/supabase/client";
import { ConsultationFormData } from "@/components/consultation/types";
import { Database } from "@/integrations/supabase/types";

type DatabaseConsultation = Database['public']['Tables']['consultations']['Row'];
type DatabaseConsultationInsert = Database['public']['Tables']['consultations']['Insert'];
type DatabaseAiAnalysis = Database['public']['Tables']['ai_analysis']['Row'];

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
  // Campos originais do médico
  hda_original?: string;
  hipotese_diagnostica_original?: string;
  conduta_original?: string;
  comorbidades_original?: any;
  medicacoes_original?: any;
  alergias_original?: any;
  // Campos de controle de análise
  analysis_started_at?: string;
  analysis_completed_at?: string;
  webhook_lock_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AiAnalysisRecord {
  id: string;
  consultation_id: string;
  hda_ai?: string;
  comorbidades_ai?: string;
  medicacoes_ai?: string;
  alergias_ai?: string;
  hipotese_diagnostica_ai?: string;
  conduta_ai?: string;
  analysis_timestamp: string;
  webhook_attempts: number;
  processing_status: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookPayload {
  id: string;
  consultation_id: string;
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
  // Campos originais
  hda_original: dbRecord.hda_original || undefined,
  hipotese_diagnostica_original: dbRecord.hipotese_diagnostica_original || undefined,
  conduta_original: dbRecord.conduta_original || undefined,
  comorbidades_original: dbRecord.comorbidades_original || undefined,
  medicacoes_original: dbRecord.medicacoes_original || undefined,
  alergias_original: dbRecord.alergias_original || undefined,
  // Campos de controle
  analysis_started_at: dbRecord.analysis_started_at || undefined,
  analysis_completed_at: dbRecord.analysis_completed_at || undefined,
  webhook_lock_id: dbRecord.webhook_lock_id || undefined,
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

  async getAiAnalysis(consultationId: string): Promise<AiAnalysisRecord | null> {
    const { data, error } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('consultation_id', consultationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching AI analysis by consultation ID:', error);
      throw error;
    }

    return data as AiAnalysisRecord | null;
  },

  async getAiAnalysisById(analysisId: string): Promise<AiAnalysisRecord | null> {
    // Apenas remover espaços, NÃO converter para minúsculas
    const normalizedId = analysisId.trim();
    console.log(`[consultationService] Buscando análise de IA:`, {
      idOriginal: analysisId,
      idNormalizado: normalizedId,
      tamanho: analysisId.length,
      tamanhoNormalizado: normalizedId.length
    });
    
    const { data, error } = await supabase
      .from('ai_analysis')
      .select(`
        id,
        consultation_id,
        hda_ai,
        comorbidades_ai,
        medicacoes_ai,
        alergias_ai,
        hipotese_diagnostica_ai,
        conduta_ai,
        analysis_timestamp,
        webhook_attempts,
        processing_status,
        created_at,
        updated_at
      `)
      .eq('id', normalizedId)
      .maybeSingle();

    if (error) {
      console.error('[consultationService] Erro ao buscar análise da IA por ID:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Tentar listar todas as análises para debug
      console.log('Tentando listar análises recentes para debug...');
      const { data: recentAnalyses } = await supabase
        .from('ai_analysis')
        .select('id, consultation_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentAnalyses) {
        console.log('Análises recentes no banco:', recentAnalyses);
      }
      
      throw new Error(`Falha ao recuperar análise da IA: ${error.message}`);
    }

    if (!data) {
      console.warn(`[consultationService] Análise da IA não encontrada para ID: ${normalizedId}`);
      
      // Tentar listar análises recentes para debug
      const { data: recentAnalyses } = await supabase
        .from('ai_analysis')
        .select('id, consultation_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentAnalyses) {
        console.log('Análises recentes no banco (não encontrou o ID):', recentAnalyses);
      }
      
      return null;
    }

    console.log('[consultationService] Análise da IA recuperada com sucesso:', {
      id: data.id,
      consultation_id: data.consultation_id,
      tem_dados: !!(data.hda_ai || data.comorbidades_ai || data.medicacoes_ai || 
                   data.alergias_ai || data.hipotese_diagnostica_ai || data.conduta_ai),
      processing_status: data.processing_status
    });
    
    return data as AiAnalysisRecord;
  },

  async validateWebhookPayload(payload: any): Promise<WebhookPayload | null> {
    if (!payload || typeof payload !== 'object') {
      console.error('Payload do webhook inválido: deve ser um objeto');
      return null;
    }

    const { id, consultation_id } = payload;

    if (!id || typeof id !== 'string') {
      console.error('Campo "id" obrigatório e deve ser uma string');
      return null;
    }

    if (!consultation_id || typeof consultation_id !== 'string') {
      console.error('Campo "consultation_id" obrigatório e deve ser uma string');
      return null;
    }

    console.log('Payload do webhook validado com sucesso:', { id, consultation_id });
    return { id, consultation_id };
  },

  async createConsultation(formData: ConsultationFormData, recordingDuration: number): Promise<ConsultationRecord> {
    const consultationData: DatabaseConsultationInsert = {
      patient_name: formData.nomePaciente,
      consultation_type: formData.consultationType,
      status: 'generating-analysis',
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
      recording_duration: recordingDuration,
      // Preservar dados originais
      hda_original: formData.hda,
      hipotese_diagnostica_original: formData.hipoteseDiagnostica,
      conduta_original: formData.conduta,
      comorbidades_original: formData.comorbidades as any,
      medicacoes_original: formData.medicacoes as any,
      alergias_original: formData.alergias as any
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

  async startAnalysis(consultationId: string): Promise<boolean> {
    // Gerar um UUID único para o lock
    const lockId = crypto.randomUUID();
    
    // Tentar adquirir o lock atomicamente
    const { data, error } = await supabase
      .from('consultations')
      .update({ 
        webhook_lock_id: lockId,
        analysis_started_at: new Date().toISOString()
      })
      .eq('id', consultationId)
      .is('webhook_lock_id', null)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error acquiring analysis lock:', error);
      return false;
    }

    // Se não conseguiu adquirir o lock, análise já está em andamento
    if (!data) {
      console.log(`Analysis already in progress for consultation ${consultationId}`);
      return false;
    }

    console.log(`Analysis lock acquired for consultation ${consultationId} with lock ID ${lockId}`);
    return true;
  },

  async saveAiAnalysis(consultationId: string, analysisData: any): Promise<void> {
    try {
      // Inserir ou atualizar análise da IA
      const { error: analysisError } = await supabase
        .from('ai_analysis')
        .upsert({
          consultation_id: consultationId,
          hda_ai: analysisData['História da Doença Atual (HDA)'] || analysisData.hda,
          hipotese_diagnostica_ai: analysisData['Hipótese Diagnóstica'] || analysisData.hipoteseDiagnostica,
          conduta_ai: analysisData['Conduta'] || analysisData.conduta,
          comorbidades_ai: analysisData['Comorbidades'] || analysisData.comorbidades,
          medicacoes_ai: analysisData['Medicações de Uso Contínuo'] || analysisData.medicacoes,
          alergias_ai: analysisData['Alergias'] || analysisData.alergias,
          processing_status: 'completed'
        });

      if (analysisError) {
        console.error('Error saving AI analysis:', analysisError);
        throw analysisError;
      }

      // Atualizar status da consulta
      const { error: consultationError } = await supabase
        .from('consultations')
        .update({ 
          status: 'pending-review',
          analysis_completed_at: new Date().toISOString(),
          webhook_lock_id: null // Liberar o lock
        })
        .eq('id', consultationId);

      if (consultationError) {
        console.error('Error updating consultation status:', consultationError);
        throw consultationError;
      }

      console.log(`AI analysis saved successfully for consultation ${consultationId}`);
    } catch (error) {
      // Em caso de erro, liberar o lock
      await supabase
        .from('consultations')
        .update({ webhook_lock_id: null })
        .eq('id', consultationId);
      
      throw error;
    }
  },

  async releaseAnalysisLock(consultationId: string): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .update({ webhook_lock_id: null })
      .eq('id', consultationId);

    if (error) {
      console.error('Error releasing analysis lock:', error);
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