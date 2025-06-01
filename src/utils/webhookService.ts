
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

    // Simulação de chamada ao webhook (substitua pela sua chamada real)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulação de dados de análise retornados pelo webhook
    const analysisData = {
      'História da Doença Atual (HDA)': 'Análise da HDA pela IA...',
      'Hipótese Diagnóstica': 'Sugestão de hipótese diagnóstica da IA...',
      'Conduta': 'Sugestão de conduta da IA...',
      'Comorbidades': 'Comorbidades identificadas pela IA...',
      'Medicações de Uso Contínuo': 'Medicações identificadas pela IA...',
      'Alergias': 'Alergias identificadas pela IA...'
    };

    console.log(`Análise da consulta ${consultationId} concluída. Dados recebidos:`, analysisData);

    // Atualizar consulta no Supabase APENAS com os dados da análise da IA
    // Os campos originais já foram preservados na criação inicial
    await supabase.from('consultations')
      .update({
        hda: analysisData['História da Doença Atual (HDA)'],
        hipotese_diagnostica: analysisData['Hipótese Diagnóstica'],
        conduta: analysisData['Conduta'],
        comorbidades: { tem: 'sim', especificar: analysisData['Comorbidades'] },
        medicacoes: { tem: 'sim', especificar: analysisData['Medicações de Uso Contínuo'] },
        alergias: { tem: 'sim', especificar: analysisData['Alergias'] },
        status: 'pending-review'
      })
      .eq('id', consultationId);

    console.log(`Consulta ${consultationId} atualizada com os dados da análise.`);

  } catch (error) {
    console.error(`Erro ao processar análise da consulta ${consultationId}:`, error);
    throw error; // Rejeitar a promise para que o chamador possa lidar com o erro
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
