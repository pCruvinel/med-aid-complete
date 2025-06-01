
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { consultationData, audioTranscription } = await req.json();

    console.log('Processing consultation analysis for:', consultationData.patient_name);

    // Preparar prompt para análise médica
    const prompt = `
Você é um assistente médico especializado em análise de consultas. Analise os dados da consulta abaixo e gere uma análise estruturada.

DADOS DA CONSULTA:
- Paciente: ${consultationData.patient_name}
- Tipo de Consulta: ${consultationData.consultation_type}
- HDA Inicial: ${consultationData.hda || 'Não informado'}
- Comorbidades: ${JSON.stringify(consultationData.comorbidades) || 'Não informado'}
- Medicações: ${JSON.stringify(consultationData.medicacoes) || 'Não informado'}
- Alergias: ${JSON.stringify(consultationData.alergias) || 'Não informado'}
- Sinais Vitais: ${JSON.stringify(consultationData.sinais_vitais) || 'Não informado'}
- Exame Físico: ${JSON.stringify(consultationData.exame_fisico) || 'Não informado'}

${audioTranscription ? `TRANSCRIÇÃO DO ÁUDIO: ${audioTranscription}` : ''}

Por favor, analise todas essas informações e retorne APENAS um JSON válido no seguinte formato:
{
  "História da Doença Atual (HDA)": "Descrição detalhada da história da doença atual baseada nos dados fornecidos",
  "Comorbidades": "Lista de comorbidades identificadas ou 'Não apresenta comorbidades preexistentes'",
  "Medicações de Uso Contínuo": "Lista de medicações em uso ou 'Não faz uso de medicações contínuas'",
  "Alergias": "Lista de alergias conhecidas ou 'Não possui alergias conhecidas'",
  "Hipótese Diagnóstica": "Lista numerada das hipóteses diagnósticas principais",
  "Conduta": "Plano de conduta e orientações para o paciente"
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um assistente médico especializado. Sempre retorne respostas em formato JSON válido conforme solicitado.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const generatedAnalysis = data.choices[0].message.content;

    console.log('Generated analysis:', generatedAnalysis);

    // Tentar fazer parse do JSON retornado
    let analysisJson;
    try {
      analysisJson = JSON.parse(generatedAnalysis);
    } catch (parseError) {
      console.error('Error parsing AI response as JSON:', parseError);
      throw new Error('Resposta da IA não está em formato JSON válido');
    }

    return new Response(JSON.stringify({ 
      output: analysisJson 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-consultation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
