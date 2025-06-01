
import { useState, useEffect } from "react";
import { consultationService, ConsultationRecord } from "@/services/consultationService";
import { toast } from "@/hooks/use-toast";

export const useConsultations = () => {
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await consultationService.getAllConsultations();
      setConsultations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar consultas';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConsultationStatus = async (id: string, status: 'in-progress' | 'pending-review' | 'completed' | 'generating-analysis') => {
    try {
      await consultationService.updateConsultationStatus(id, status);
      setConsultations(prev => 
        prev.map(consultation => 
          consultation.id === id 
            ? { ...consultation, status }
            : consultation
        )
      );
      
      const statusMessages = {
        'in-progress': 'Consulta marcada como em andamento',
        'pending-review': 'Consulta pronta para revisão',
        'completed': 'Consulta finalizada',
        'generating-analysis': 'Iniciando análise da consulta'
      };
      
      toast({
        title: "Status atualizado",
        description: statusMessages[status],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const addConsultation = (consultation: ConsultationRecord) => {
    setConsultations(prev => [consultation, ...prev]);
  };

  const updateConsultation = (consultationId: string, updates: Partial<ConsultationRecord>) => {
    setConsultations(prev => 
      prev.map(consultation => 
        consultation.id === consultationId 
          ? { ...consultation, ...updates }
          : consultation
      )
    );
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  return {
    consultations,
    loading,
    error,
    fetchConsultations,
    updateConsultationStatus,
    addConsultation,
    updateConsultation
  };
};
