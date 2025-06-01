
import { useState, useCallback } from 'react';
import { consultationService, AiAnalysisRecord, WebhookPayload } from '@/services/consultationService';
import { toast } from '@/hooks/use-toast';

export const useReviewWebhook = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processWebhookPayload = useCallback(async (payload: any): Promise<AiAnalysisRecord | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Processando payload do webhook de revisão:', payload);

      // Validar estrutura do payload
      const validatedPayload = await consultationService.validateWebhookPayload(payload);
      if (!validatedPayload) {
        throw new Error('Estrutura do payload do webhook é inválida');
      }

      // Buscar análise da IA pelo ID específico
      const aiAnalysis = await consultationService.getAiAnalysisById(validatedPayload.id);
      
      if (!aiAnalysis) {
        throw new Error(`Análise da IA não encontrada para o ID: ${validatedPayload.id}`);
      }

      // Verificar se a análise pertence à consulta correta
      if (aiAnalysis.consultation_id !== validatedPayload.consultation_id) {
        console.warn(`Mismatch entre consultation_id do payload (${validatedPayload.consultation_id}) e da análise (${aiAnalysis.consultation_id})`);
      }

      console.log('Análise da IA recuperada com sucesso via webhook:', aiAnalysis);

      toast({
        title: "Análise recuperada",
        description: "Sugestões da IA carregadas com sucesso.",
      });

      return aiAnalysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar webhook de revisão';
      console.error('Erro no processamento do webhook:', err);
      
      setError(errorMessage);
      toast({
        title: "Erro no webhook",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    processWebhookPayload,
    loading,
    error,
    resetError
  };
};
