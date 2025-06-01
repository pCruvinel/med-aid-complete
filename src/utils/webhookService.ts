
import { supabase } from "@/integrations/supabase/client";
import { consultationService } from "@/services/consultationService";

export const sendToWebhook = async (consultationData: any) => {
  console.log('Webhook service called with data:', {
    nomePaciente: consultationData.nomePaciente,
    consultationType: consultationData.consultationType,
    hasAudio: !!consultationData.audioBlob,
    recordingDuration: consultationData.recordingDuration,
    timestamp: consultationData.timestamp
  });

  try {
    // Simular transcrição de áudio (em um cenário real, você usaria um serviço de transcrição)
    let audioTranscription = null;
    if (consultationData.audioBlob) {
      audioTranscription = "Transcrição simulada do áudio da consulta médica...";
    }

    // Chamar a Edge Function para análise
    const { data, error } = await supabase.functions.invoke('analyze-consultation', {
      body: {
        consultationData: {
          patient_name: consultationData.nomePaciente,
          consultation_type: consultationData.consultationType,
          hda: consultationData.hda,
          comorbidades: consultationData.comorbidades,
          medicacoes: consultationData.medicacoes,
          alergias: consultationData.alergias,
          sinais_vitais: consultationData.sinaisVitais,
          exame_fisico: consultationData.exameFisico,
        },
        audioTranscription
      }
    });

    if (error) {
      console.error('Error calling analyze-consultation function:', error);
      throw new Error('Erro ao processar análise da consulta');
    }

    console.log('Analysis result:', data);
    
    return { 
      success: true, 
      analysis: data.output 
    };
  } catch (error) {
    console.error('Webhook error:', error);
    throw new Error('Erro no processamento da consulta');
  }
};

export const processConsultationAnalysis = async (consultationId: string, consultationData: any) => {
  try {
    console.log('Starting analysis processing for consultation:', consultationId);
    
    // Chamar o webhook para processar a análise
    const result = await sendToWebhook(consultationData);
    
    if (result.success && result.analysis) {
      // Atualizar a consulta com os dados da análise
      await consultationService.updateConsultationWithAnalysis(consultationId, result.analysis);
      
      console.log('Consultation analysis completed and saved for:', consultationId);
      return { success: true };
    } else {
      throw new Error('Análise não foi gerada corretamente');
    }
  } catch (error) {
    console.error('Error processing consultation analysis:', error);
    
    // Em caso de erro, atualizar status para pending-review mesmo assim
    await consultationService.updateConsultationStatus(consultationId, 'pending-review');
    
    throw error;
  }
};
