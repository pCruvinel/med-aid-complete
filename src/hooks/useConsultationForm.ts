import { useState } from "react";
import { ConsultationFormData } from "@/components/consultation/types";

export const useConsultationForm = () => {
  const [formData, setFormData] = useState<ConsultationFormData>({
    nomePaciente: '',
    consultationType: '',
    protocols: {
      sepseAdulto: { sirs: false, disfuncao: false, news: false },
      sepsePediatrica: false,
      avc: false,
      dorToracica: false,
      naoSeAplica: false
    },
    hda: '',
    comorbidades: { tem: '', especificar: '' },
    medicacoes: { tem: '', especificar: '' },
    alergias: { tem: '', especificar: '' },
    sinaisVitais: {
      pa1: '', pa2: '', fc: '', fr: '', hgt: '', temperatura: '',
      alteracaoConsciencia: '', dor: ''
    },
    exameFisico: {
      estadoGeral: '',
      respiratorio: '',
      cardiovascular: '',
      abdome: '',
      extremidades: '',
      nervoso: '',
      orofaringe: '',
      otoscopia: ''
    },
    hipoteseDiagnostica: '',
    conduta: '- Oriento sinais de alarme e retorno em caso de não melhora dos sintomas;\n- Prescrito sintomáticos;',
    examesComplementares: '',
    reavaliacaoMedica: '',
    complementoEvolucao: ''
  });

  const updateFormData = (field: keyof ConsultationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedFormData = (parent: keyof ConsultationFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent] as any, [field]: value }
    }));
  };

  const updateProtocols = (field: keyof ConsultationFormData['protocols'], value: any) => {
    setFormData(prev => ({
      ...prev,
      protocols: { ...prev.protocols, [field]: value }
    }));
  };

  const updateSepseAdulto = (field: keyof ConsultationFormData['protocols']['sepseAdulto'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      protocols: {
        ...prev.protocols,
        sepseAdulto: { ...prev.protocols.sepseAdulto, [field]: value }
      }
    }));
  };

  return {
    formData,
    setFormData,
    updateFormData,
    updateNestedFormData,
    updateProtocols,
    updateSepseAdulto
  };
};
