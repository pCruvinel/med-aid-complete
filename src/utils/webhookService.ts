
import { consultationService } from "@/services/consultationService";
import { WEBHOOK_CONFIG } from "@/config/webhook";
import { blobToBase64 } from "./audioUtils";

// Função para normalizar valores null/undefined/vazios para 'vazio'
const normalizeValue = (value: any): any => {
  if (value === null || value === undefined || value === '') {
    return 'vazio';
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    const normalized: any = {};
    for (const key in value) {
      normalized[key] = normalizeValue(value[key]);
    }
    return normalized;
  }
  
  return value;
};

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

    // Preparar dados completos para envio ao N8N com todos os campos
    const webhookPayload = {
      consultation: {
        patient_name: normalizeValue(consultationData.nomePaciente),
        consultation_type: normalizeValue(consultationData.consultationType),
        hda: normalizeValue(consultationData.hda),
        
        // Comorbidades completas
        comorbidades: {
          tem: normalizeValue(consultationData.comorbidades?.tem),
          especificar: normalizeValue(consultationData.comorbidades?.especificar)
        },
        
        // Medicações completas
        medicacoes: {
          tem: normalizeValue(consultationData.medicacoes?.tem),
          especificar: normalizeValue(consultationData.medicacoes?.especificar)
        },
        
        // Alergias completas
        alergias: {
          tem: normalizeValue(consultationData.alergias?.tem),
          especificar: normalizeValue(consultationData.alergias?.especificar)
        },
        
        // Sinais vitais completos
        sinais_vitais: {
          pa1: normalizeValue(consultationData.sinaisVitais?.pa1),
          pa2: normalizeValue(consultationData.sinaisVitais?.pa2),
          fc: normalizeValue(consultationData.sinaisVitais?.fc),
          fr: normalizeValue(consultationData.sinaisVitais?.fr),
          hgt: normalizeValue(consultationData.sinaisVitais?.hgt),
          temperatura: normalizeValue(consultationData.sinaisVitais?.temperatura),
          alteracaoConsciencia: normalizeValue(consultationData.sinaisVitais?.alteracaoConsciencia),
          dor: normalizeValue(consultationData.sinaisVitais?.dor)
        },
        
        // Exame físico completo
        exame_fisico: {
          estadoGeral: normalizeValue(consultationData.exameFisico?.estadoGeral),
          respiratorio: normalizeValue(consultationData.exameFisico?.respiratorio),
          cardiovascular: normalizeValue(consultationData.exameFisico?.cardiovascular),
          abdome: normalizeValue(consultationData.exameFisico?.abdome),
          extremidades: normalizeValue(consultationData.exameFisico?.extremidades),
          nervoso: normalizeValue(consultationData.exameFisico?.nervoso),
          orofaringe: normalizeValue(consultationData.exameFisico?.orofaringe),
          otoscopia: normalizeValue(consultationData.exameFisico?.otoscopia)
        },
        
        // Protocolos completos
        protocols: {
          sepseAdulto: {
            sirs: normalizeValue(consultationData.protocols?.sepseAdulto?.sirs),
            disfuncao: normalizeValue(consultationData.protocols?.sepseAdulto?.disfuncao),
            news: normalizeValue(consultationData.protocols?.sepseAdulto?.news)
          },
          sepsePediatrica: normalizeValue(consultationData.protocols?.sepsePediatrica),
          avc: normalizeValue(consultationData.protocols?.avc),
          dorToracica: normalizeValue(consultationData.protocols?.dorToracica),
          naoSeAplica: normalizeValue(consultationData.protocols?.naoSeAplica)
        },
        
        // Campos de diagnóstico e conduta
        hipotese_diagnostica: normalizeValue(consultationData.hipoteseDiagnostica),
        conduta: normalizeValue(consultationData.conduta),
        exames_complementares: normalizeValue(consultationData.examesComplementares),
        reavaliacao_medica: normalizeValue(consultationData.reavaliacaoMedica),
        complemento_evolucao: normalizeValue(consultationData.complementoEvolucao),
        
        // Duração da gravação
        recording_duration: normalizeValue(consultationData.recordingDuration)
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
