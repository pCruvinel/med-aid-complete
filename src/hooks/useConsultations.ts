
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

  const updateConsultationStatus = async (id: string, status: 'in-progress' | 'pending-review' | 'completed') => {
    try {
      await consultationService.updateConsultationStatus(id, status);
      setConsultations(prev => 
        prev.map(consultation => 
          consultation.id === id 
            ? { ...consultation, status }
            : consultation
        )
      );
      toast({
        title: "Status atualizado",
        description: "O status da consulta foi atualizado com sucesso.",
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

  useEffect(() => {
    fetchConsultations();
  }, []);

  return {
    consultations,
    loading,
    error,
    fetchConsultations,
    updateConsultationStatus,
    addConsultation
  };
};
