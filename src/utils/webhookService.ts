
import { supabase } from "@/integrations/supabase/client";
import { ConsultationFormData } from "@/components/consultation/types";
import { WEBHOOK_CONFIG } from "@/config/webhook";
import { blobToBase64 } from "./audioUtils";

export const sendToWebhook = async (consultationData: ConsultationFormData & { audioBlob?: Blob }) => {
  try {
    console.log('Enviando dados para webhook...', consultationData);

    // Save consultation to database first
    const consultationInsert = {
      patient_name: consultationData.nomePaciente,
      consultation_type: consultationData.consultationType,
      hda: consultationData.hda,
      hipotese_diagnostica: consultationData.hipoteseDiagnostica,
      conduta: consultationData.conduta,
      exames_complementares: consultationData.examesComplementares,
      reavaliacao_medica: consultationData.reavaliacaoMedica,
      complemento_evolucao: consultationData.complementoEvolucao,
      comorbidades: consultationData.comorbidades as any,
      medicacoes: consultationData.medicacoes as any,
      alergias: consultationData.alergias as any,
      sinais_vitais: consultationData.sinaisVitais as any,
      exame_fisico: consultationData.exameFisico as any,
      protocols: consultationData.protocols as any,
      // Preservar dados originais do médico
      hda_original: consultationData.hda,
      hipotese_diagnostica_original: consultationData.hipoteseDiagnostica,
      conduta_original: consultationData.conduta,
      comorbidades_original: consultationData.comorbidades as any,
      medicacoes_original: consultationData.medicacoes as any,
      alergias_original: consultationData.alergias as any,
      status: 'generating-analysis'
    };

    const { data: consultation, error: insertError } = await supabase
      .from('consultations')
      .insert(consultationInsert)
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao salvar consulta:', insertError);
      throw new Error('Falha ao salvar consulta no banco de dados');
    }

    console.log('Consulta salva com ID:', consultation.id);

    // Start analysis process
    await processConsultationAnalysis(consultation.id, consultationData);

    return consultation;
  } catch (error) {
    console.error('Erro no sendToWebhook:', error);
    throw error;
  }
};

export const processConsultationAnalysis = async (consultationId: string, consultationData: ConsultationFormData & { audioBlob?: Blob }) => {
  try {
    console.log(`Iniciando análise da consulta ${consultationId} via webhook...`);

    // Converter áudio para Base64 se disponível
    let audioBase64 = null;
    if (consultationData.audioBlob) {
      console.log('Convertendo áudio para Base64...');
      audioBase64 = await blobToBase64(consultationData.audioBlob);
      console.log('Áudio convertido para Base64, tamanho:', audioBase64.length);
    }

    // Mapear tipo de atendimento
    const tipoAtendimentoMap: Record<string, string> = {
      'avaliacao': 'Avaliação Médica',
      'reavaliacao': 'Reavaliação Médica',
      'complementacao': 'Complementação de Evolução'
    };

    // Função para tratar campos vazios
    const formatField = (value: any): string => {
      if (!value || value === '' || value === null || value === undefined) {
        return 'Vazio';
      }
      if (typeof value === 'object') {
        // Para campos condicionais como comorbidades, medicações, alergias
        if (value.tem === 'não' || value.tem === '' || !value.especificar || value.especificar === '') {
          return 'Vazio';
        }
        return value.especificar || 'Vazio';
      }
      return String(value);
    };

    // Preparar dados completos para envio ao webhook
    const webhookData = {
      consultationId,
      timestamp: new Date().toISOString(),
      tipoAtendimento: tipoAtendimentoMap[consultationData.consultationType] || consultationData.consultationType,
      nomePaciente: formatField(consultationData.nomePaciente),
      
      // Protocolos
      protocols: {
        sepseAdulto: {
          sirs: consultationData.protocols?.sepseAdulto?.sirs || false,
          disfuncao: consultationData.protocols?.sepseAdulto?.disfuncao || false,
          news: consultationData.protocols?.sepseAdulto?.news || false
        },
        sepsePediatrica: consultationData.protocols?.sepsePediatrica || false,
        avc: consultationData.protocols?.avc || false,
        dorToracica: consultationData.protocols?.dorToracica || false,
        naoSeAplica: consultationData.protocols?.naoSeAplica || false
      },

      // Dados clínicos principais
      hda: formatField(consultationData.hda),
      comorbidades: formatField(consultationData.comorbidades),
      medicacoes: formatField(consultationData.medicacoes),
      alergias: formatField(consultationData.alergias),

      // Sinais vitais
      sinaisVitais: {
        pa1: formatField(consultationData.sinaisVitais?.pa1),
        pa2: formatField(consultationData.sinaisVitais?.pa2),
        fc: formatField(consultationData.sinaisVitais?.fc),
        fr: formatField(consultationData.sinaisVitais?.fr),
        hgt: formatField(consultationData.sinaisVitais?.hgt),
        temperatura: formatField(consultationData.sinaisVitais?.temperatura),
        alteracaoConsciencia: formatField(consultationData.sinaisVitais?.alteracaoConsciencia),
        dor: formatField(consultationData.sinaisVitais?.dor)
      },

      // Exame físico
      exameFisico: {
        estadoGeral: formatField(consultationData.exameFisico?.estadoGeral),
        respiratorio: formatField(consultationData.exameFisico?.respiratorio),
        cardiovascular: formatField(consultationData.exameFisico?.cardiovascular),
        abdome: formatField(consultationData.exameFisico?.abdome),
        extremidades: formatField(consultationData.exameFisico?.extremidades),
        nervoso: formatField(consultationData.exameFisico?.nervoso),
        orofaringe: formatField(consultationData.exameFisico?.orofaringe),
        otoscopia: formatField(consultationData.exameFisico?.otoscopia)
      },

      // Avaliação e conduta
      hipoteseDiagnostica: formatField(consultationData.hipoteseDiagnostica),
      conduta: formatField(consultationData.conduta),
      examesComplementares: formatField(consultationData.examesComplementares),
      reavaliacaoMedica: formatField(consultationData.reavaliacaoMedica),
      complementoEvolucao: formatField(consultationData.complementoEvolucao),

      // Áudio em Base64
      audioBase64: audioBase64
    };

    console.log('Enviando dados completos para webhook:', {
      ...webhookData,
      audioBase64: audioBase64 ? `[Base64 String - ${audioBase64.length} chars]` : null
    });

    // Fazer chamada HTTP real para o webhook
    const analysisData = await makeWebhookRequest(webhookData);

    console.log(`Análise da consulta ${consultationId} concluída. Dados recebidos:`, analysisData);

    // Atualizar consulta no Supabase APENAS com os dados da análise da IA
    await supabase.from('consultations')
      .update({
        hda: analysisData['História da Doença Atual (HDA)'] || analysisData.hda,
        hipotese_diagnostica: analysisData['Hipótese Diagnóstica'] || analysisData.hipoteseDiagnostica,
        conduta: analysisData['Conduta'] || analysisData.conduta,
        comorbidades: analysisData['Comorbidades'] ? 
          { tem: 'sim', especificar: analysisData['Comorbidades'] } :
          (analysisData.comorbidades || { tem: 'não', especificar: '' }),
        medicacoes: analysisData['Medicações de Uso Contínuo'] ? 
          { tem: 'sim', especificar: analysisData['Medicações de Uso Contínuo'] } :
          (analysisData.medicacoes || { tem: 'não', especificar: '' }),
        alergias: analysisData['Alergias'] ? 
          { tem: 'sim', especificar: analysisData['Alergias'] } :
          (analysisData.alergias || { tem: 'não', especificar: '' }),
        status: 'pending-review'
      })
      .eq('id', consultationId);

    console.log(`Consulta ${consultationId} atualizada com os dados da análise.`);

  } catch (error) {
    console.error(`Erro ao processar análise da consulta ${consultationId}:`, error);
    
    // Atualizar status da consulta para erro - mantém em análise para retry manual
    await supabase.from('consultations')
      .update({ status: 'generating-analysis' })
      .eq('id', consultationId);
    
    throw error;
  }
};

const makeWebhookRequest = async (data: any, retryCount = 0): Promise<any> => {
  try {
    console.log(`Tentativa ${retryCount + 1} de envio para webhook:`, WEBHOOK_CONFIG.N8N_WEBHOOK_URL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_CONFIG.TIMEOUT);

    const response = await fetch(WEBHOOK_CONFIG.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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

    const responseData = await response.json();
    console.log('Dados recebidos do webhook:', responseData);

    return responseData;

  } catch (error) {
    console.error(`Erro na tentativa ${retryCount + 1}:`, error);

    // Se ainda temos tentativas disponíveis, tentar novamente
    if (retryCount < WEBHOOK_CONFIG.MAX_RETRIES) {
      console.log(`Aguardando ${WEBHOOK_CONFIG.RETRY_DELAY}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, WEBHOOK_CONFIG.RETRY_DELAY));
      return makeWebhookRequest(data, retryCount + 1);
    }

    // Se esgotaram as tentativas, lançar erro - sem fallback mockup
    console.error('Todas as tentativas de webhook falharam. Não há dados mockup - funcionalidade real apenas.');
    throw new Error(`Falha na comunicação com o webhook após ${WEBHOOK_CONFIG.MAX_RETRIES + 1} tentativas: ${error.message}`);
  }
};

export const generateFinalDocument = async (finalData: any) => {
  try {
    console.log('Calling generate-final-document edge function with data:', finalData);

    const { data, error } = await supabase.functions.invoke('generate-final-document', {
      body: finalData
    });

    if (error) {
      console.error('Error response from generate-final-document:', error);
      throw new Error(`Error calling edge function: ${error.message}`);
    }

    console.log('Final document generation result:', data);
    return data;
  } catch (error) {
    console.error('Error in generateFinalDocument:', error);
    throw error;
  }
};
