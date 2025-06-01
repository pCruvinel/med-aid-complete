
import { consultationService } from "@/services/consultationService";
import { WEBHOOK_CONFIG } from "@/config/webhook";
import { blobToBase64 } from "./audioUtils";

export const sendToWebhook = async (consultationData: any) => {
  console.log('Webhook service called with data:', {
    nomePaciente: consultationData.nomePaciente,
    consultationType: consultationData.consultationType,
    hasAudio: !!consultationData.audioBlob,
    recordingDuration: consultationData.recordingDuration,
    timestamp: consultationData.timestamp
  });

  try {
    // Convert audio blob to base64 if present
    let audioBase64 = null;
    let audioSize = 0;
    let audioMimeType = 'audio/webm';

    if (consultationData.audioBlob) {
      console.log('Converting audio blob to base64...');
      audioBase64 = await blobToBase64(consultationData.audioBlob);
      audioSize = consultationData.audioBlob.size;
      audioMimeType = consultationData.audioBlob.type || 'audio/webm';
      console.log('Audio converted to base64, size:', audioSize, 'bytes');
    }

    // Preparar dados para envio ao N8N
    const webhookPayload = {
      consultation: {
        patient_name: consultationData.nomePaciente,
        consultation_type: consultationData.consultationType,
        hda: consultationData.hda,
        comorbidades: consultationData.comorbidades,
        medicacoes: consultationData.medicacoes,
        alergias: consultationData.alergias,
        sinais_vitais: consultationData.sinaisVitais,
        exame_fisico: consultationData.exameFisico,
        hipotese_diagnostica: consultationData.hipoteseDiagnostica,
        conduta: consultationData.conduta,
        exames_complementares: consultationData.examesComplementares,
        protocols: consultationData.protocols,
        recording_duration: consultationData.recordingDuration
      },
      audio: {
        hasAudio: !!consultationData.audioBlob,
        duration: consultationData.recordingDuration || 0,
        data: audioBase64,
        mimeType: audioMimeType,
        size: audioSize
      },
      timestamp: consultationData.timestamp || new Date().toISOString()
    };

    console.log('Sending webhook payload to N8N:', {
      ...webhookPayload,
      audio: {
        ...webhookPayload.audio,
        data: audioBase64 ? `[Base64 data - ${audioSize} bytes]` : null
      }
    });

    // Fazer chamada HTTP para o webhook do N8N com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_CONFIG.TIMEOUT);

    const response = await fetch(WEBHOOK_CONFIG.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook call failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Webhook response from N8N:', result);

    // Verificar se a resposta tem o formato esperado
    if (!result || !result.output) {
      throw new Error('Resposta do webhook não está no formato esperado');
    }

    return { 
      success: true, 
      analysis: result.output 
    };
  } catch (error) {
    console.error('Webhook error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Timeout na chamada do webhook - verifique se o N8N está respondendo');
    }
    
    if (error.message && error.message.includes('Failed to convert blob to base64')) {
      throw new Error('Erro ao converter áudio para Base64');
    }
    
    throw new Error('Erro no processamento da consulta via webhook');
  }
};

export const processConsultationAnalysis = async (consultationId: string, consultationData: any) => {
  try {
    console.log('Starting analysis processing for consultation:', consultationId);
    
    // Chamar o webhook N8N para processar a análise
    const result = await sendToWebhook(consultationData);
    
    if (result.success && result.analysis) {
      // Atualizar a consulta com os dados da análise retornados pelo N8N
      await consultationService.updateConsultationWithAnalysis(consultationId, result.analysis);
      
      console.log('Consultation analysis completed and saved for:', consultationId);
      return { success: true };
    } else {
      throw new Error('Análise não foi gerada corretamente pelo N8N');
    }
  } catch (error) {
    console.error('Error processing consultation analysis:', error);
    
    // Em caso de erro, atualizar status para pending-review mesmo assim
    await consultationService.updateConsultationStatus(consultationId, 'pending-review');
    
    throw error;
  }
};
