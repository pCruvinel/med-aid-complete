
import { supabase } from "@/integrations/supabase/client";
import { ConsultationFormData } from "@/components/consultation/types";
import { WEBHOOK_CONFIG } from "@/config/webhook";

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

export const processConsultationAnalysis = async (consultationId: string, consultationData: ConsultationFormData) => {
  try {
    console.log(`Iniciando análise da consulta ${consultationId} via webhook...`);

    // Preparar dados para envio ao webhook
    const webhookData = {
      consultationId,
      patientName: consultationData.nomePaciente,
      consultationType: consultationData.consultationType,
      timestamp: new Date().toISOString(),
      data: {
        hda: consultationData.hda,
        hipoteseDiagnostica: consultationData.hipoteseDiagnostica,
        conduta: consultationData.conduta,
        examesComplementares: consultationData.examesComplementares,
        reavaliacaoMedica: consultationData.reavaliacaoMedica,
        complementoEvolucao: consultationData.complementoEvolucao,
        comorbidades: consultationData.comorbidades,
        medicacoes: consultationData.medicacoes,
        alergias: consultationData.alergias,
        sinaisVitais: consultationData.sinaisVitais,
        exameFisico: consultationData.exameFisico,
        protocols: consultationData.protocols
      }
    };

    console.log('Enviando dados para webhook:', webhookData);

    // Fazer chamada HTTP real para o webhook com retry logic
    const analysisData = await makeWebhookRequest(webhookData);

    console.log(`Análise da consulta ${consultationId} concluída. Dados recebidos:`, analysisData);

    // Atualizar consulta no Supabase APENAS com os dados da análise da IA
    // Os campos originais já foram preservados na criação inicial
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
    
    // Atualizar status da consulta para erro
    await supabase.from('consultations')
      .update({ status: 'pending-review' })
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

    // Se esgotaram as tentativas, usar dados simulados como fallback
    console.error('Todas as tentativas de webhook falharam. Usando dados simulados como fallback.');
    return {
      'História da Doença Atual (HDA)': 'Análise da HDA pela IA (fallback após falha no webhook)...',
      'Hipótese Diagnóstica': 'Sugestão de hipótese diagnóstica da IA (fallback)...',
      'Conduta': 'Sugestão de conduta da IA (fallback)...',
      'Comorbidades': 'Comorbidades identificadas pela IA (fallback)...',
      'Medicações de Uso Contínuo': 'Medicações identificadas pela IA (fallback)...',
      'Alergias': 'Alergias identificadas pela IA (fallback)...'
    };
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
