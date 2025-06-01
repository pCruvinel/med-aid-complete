
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { 
      consultationId, 
      patientName, 
      consultationType, 
      reviewedData, 
      selectedSources,
      timestamp 
    } = await req.json();

    console.log('Generating final document for consultation:', consultationId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Gerar documento final (simulação por enquanto)
    const documentContent = generateDocumentContent({
      patientName,
      consultationType,
      reviewedData,
      selectedSources,
      timestamp
    });

    console.log('Generated document content:', documentContent);

    // Salvar documento no banco de dados (pode ser expandido futuramente)
    const { error: updateError } = await supabase
      .from('consultations')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', consultationId);

    if (updateError) {
      console.error('Error updating consultation status:', updateError);
      throw new Error('Failed to update consultation status');
    }

    console.log('Consultation status updated to completed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document generated successfully',
        documentContent 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-final-document function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateDocumentContent(data: {
  patientName: string;
  consultationType: string;
  reviewedData: any;
  selectedSources: any;
  timestamp: string;
}) {
  const { patientName, consultationType, reviewedData, selectedSources } = data;
  
  return {
    header: {
      patientName,
      consultationType,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR')
    },
    content: {
      hda: reviewedData.hda,
      comorbidades: reviewedData.comorbidades,
      medicacoes: reviewedData.medicacoes,
      alergias: reviewedData.alergias,
      hipoteseDiagnostica: reviewedData.hipoteseDiagnostica,
      conduta: reviewedData.conduta
    },
    metadata: {
      selectedSources,
      generatedAt: new Date().toISOString(),
      aiContribution: Object.values(selectedSources).filter(source => source === 'ai').length,
      doctorContribution: Object.values(selectedSources).filter(source => source === 'doctor').length
    }
  };
}
