import { supabase } from "@/integrations/supabase/client";
import { ConsultationFormData } from "@/components/consultation/types";

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

    // Atualizar consulta no Supabase com os dados da análise
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

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/generate-final-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
      },
      body: JSON.stringify(finalData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from generate-final-document:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('Final document generation result:', result);

    return result;
  } catch (error) {
    console.error('Error in generateFinalDocument:', error);
    throw error;
  }
};
