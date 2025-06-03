import { supabase } from "@/integrations/supabase/client";
import { ConsultationFormData } from "@/components/consultation/types";
import { WEBHOOK_CONFIG } from "@/config/webhook";
import { blobToBase64 } from "./audioUtils";
import { consultationService, WebhookPayload } from "@/services/consultationService";

export const sendToWebhook = async (consultationData: any) => {
  try {
    console.log('=== INICIANDO ENVIO PARA WEBHOOK ===');
    console.log('Dados da consulta:', {
      idade: consultationData.idade,
      sexo: consultationData.sexo,
      temAudio: !!consultationData.audioBlob,
      duracaoGravacao: consultationData.recordingDuration
    });

    // Converter áudio para Base64 se disponível
    let audioBase64 = null;
    if (consultationData.audioBlob) {
      console.log('Convertendo áudio para Base64...');
      audioBase64 = await blobToBase64(consultationData.audioBlob);
      console.log(`Áudio convertido: ${Math.round(audioBase64.length / 1024)}KB`);
    }

    // Preparar dados simplificados para envio ao webhook
    const webhookData = {
      timestamp: new Date().toISOString(),
      
      // Dados do paciente
      idade: consultationData.idade,
      sexo: consultationData.sexo,
      
      // Sinais vitais
      sinaisVitais: {
        pa1: consultationData.sinaisVitais?.pa1 || 'Vazio',
        pa2: consultationData.sinaisVitais?.pa2 || 'Vazio',
        fc: consultationData.sinaisVitais?.fc || 'Vazio',
        fr: consultationData.sinaisVitais?.fr || 'Vazio',
        hgt: consultationData.sinaisVitais?.hgt || 'Vazio',
        temperatura: consultationData.sinaisVitais?.temperatura || 'Vazio',
        alteracaoConsciencia: consultationData.sinaisVitais?.alteracaoConsciencia || 'Vazio',
        dor: consultationData.sinaisVitais?.dor || 'Vazio'
      },
      
      // Observações
      observacoes: consultationData.observacoes || 'Vazio',
      
      // Áudio em Base64
      audioBase64: audioBase64,
      recordingDuration: consultationData.recordingDuration
    };

    console.log('Enviando dados para webhook... (pode demorar até 2 minutos)');

    // Fazer chamada HTTP para o webhook e aguardar resposta
    const webhookResponse = await makeWebhookRequest(webhookData);

    console.log('=== RESPOSTA RECEBIDA COM SUCESSO ===');
    console.log(`Consulta médica gerada: ${webhookResponse.length} caracteres`);

    // Retornar o texto da consulta médica diretamente
    return {
      analysisText: webhookResponse || 'Consulta médica não disponível'
    };

  } catch (error) {
    console.error('=== ERRO NO ENVIO PARA WEBHOOK ===');
    console.error('Detalhes do erro:', error);
    throw error;
  }
};

// Nova função para aguardar os dados da análise estarem disponíveis
const waitForAnalysisData = async (analysisId: string, maxAttempts = 15, delayMs = 3000): Promise<any> => {
  console.log(`Aguardando dados da análise ${analysisId} estarem disponíveis...`);
  
  // Aguardar um pouco antes de começar o polling para dar tempo do n8n inserir os dados
  console.log('Aguardando 2 segundos antes de começar a buscar os dados...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const analysis = await consultationService.getAiAnalysisById(analysisId);
      
      console.log(`Tentativa ${attempt}/${maxAttempts} - Análise recuperada:`, analysis);
      
      if (analysis) {
        // Aceitar análise mesmo que processing_status não seja 'completed'
        // já que o webhook pode não estar setando esse campo
        console.log(`Análise ${analysisId} encontrada na tentativa ${attempt}`);
        console.log('Status de processamento:', analysis.processing_status);
        console.log('Dados disponíveis:', {
          hda_ai: !!analysis.hda_ai,
          comorbidades_ai: !!analysis.comorbidades_ai,
          medicacoes_ai: !!analysis.medicacoes_ai,
          alergias_ai: !!analysis.alergias_ai,
          hipotese_diagnostica_ai: !!analysis.hipotese_diagnostica_ai,
          conduta_ai: !!analysis.conduta_ai
        });
        
        // Retornar se tiver pelo menos algum dado da IA
        if (analysis.hda_ai || analysis.comorbidades_ai || analysis.medicacoes_ai || 
            analysis.alergias_ai || analysis.hipotese_diagnostica_ai || analysis.conduta_ai) {
          return analysis;
        }
      }

      console.log(`Tentativa ${attempt}/${maxAttempts} - Análise ainda não disponível ou sem dados`);
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Erro ao buscar análise na tentativa ${attempt}:`, error);
      // Continuar tentando mesmo com erro
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  // Se chegou aqui, tentar uma última vez sem validar o status
  try {
    const analysis = await consultationService.getAiAnalysisById(analysisId);
    if (analysis) {
      console.warn(`Retornando análise mesmo sem dados completos após ${maxAttempts} tentativas`);
      return analysis;
    }
  } catch (error) {
    console.error('Erro na tentativa final:', error);
  }

  throw new Error(`Análise ${analysisId} não ficou disponível após ${maxAttempts} tentativas`);
};

// Função atualizada para processar resposta do webhook de forma síncrona
export const processConsultationAnalysis = async (consultationId: string, consultationData: ConsultationFormData & { audioBlob?: Blob; recordingDuration?: number }) => {
  // Esta função agora é apenas um fallback para compatibilidade
  console.warn('processConsultationAnalysis chamada - este método está obsoleto, use sendToWebhook');
  return sendToWebhook(consultationData);
};

const makeWebhookRequest = async (data: any, retryCount = 0): Promise<any> => {
  try {
    console.log(`Tentativa ${retryCount + 1} de envio para webhook:`, WEBHOOK_CONFIG.N8N_WEBHOOK_URL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('Timeout atingido, abortando requisição...');
      controller.abort();
    }, WEBHOOK_CONFIG.TIMEOUT);

    const response = await fetch(WEBHOOK_CONFIG.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
        'Origin': window.location.origin,
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Resposta do webhook - Status:', response.status);

    if (!response.ok) {
      throw new Error(`Webhook retornou status ${response.status}: ${response.statusText}`);
    }

    // Receber texto diretamente do response body
    const responseText = await response.text();
    console.log('Texto recebido do webhook (tamanho):', responseText.length, 'caracteres');

    if (!responseText || responseText.trim() === '') {
      throw new Error('Webhook retornou resposta vazia');
    }

    return responseText;

  } catch (error) {
    console.error(`Erro na tentativa ${retryCount + 1}:`, error);

    let errorMessage = 'Erro desconhecido';
    
    if (error.name === 'AbortError') {
      errorMessage = `Timeout após ${WEBHOOK_CONFIG.TIMEOUT / 1000} segundos - o processamento está demorando mais que o esperado`;
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Erro de conexão com o servidor';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Se ainda temos tentativas disponíveis, tentar novamente
    if (retryCount < WEBHOOK_CONFIG.MAX_RETRIES) {
      console.log(`Aguardando ${WEBHOOK_CONFIG.RETRY_DELAY}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, WEBHOOK_CONFIG.RETRY_DELAY));
      return makeWebhookRequest(data, retryCount + 1);
    }

    // Se esgotaram as tentativas, lançar erro detalhado
    console.error('Todas as tentativas de webhook falharam.');
    throw new Error(`Falha na comunicação com o webhook: ${errorMessage}`);
  }
};
