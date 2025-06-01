
import { useState } from "react";
import { ConsultationFormData } from "@/components/consultation/types";

export const useConsultationForm = () => {
  const [formData, setFormData] = useState<ConsultationFormData>({
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
      estadoGeral: 'Paciente em regular estado geral, lúcido, orientado no tempo e no espaço, acianótico, anictérico e afebril. Pele e mucosas coradas e hidratadas.',
      respiratorio: '- Tórax simétrico, sem deformidades. Expansibilidade pulmonar preservada. - Ausculta: Murmúrio vesicular fisiológico presente bilateral, sem ruídos adventícios.',
      cardiovascular: '- Ausculta: Ritmo cardíaco regular em dois tempos, sem sopros.',
      abdome: '- Abdome plano, ruídos hidroaéreos presentes, normotimpânico, indolor à palpação, sem massa ou visceromegalias, sem sinais de peritonite.',
      extremidades: '- Extremidades superiores e inferiores sem edemas, panturrilhas livres, TEC < 3s. Pulsos palpáveis e simétricos.',
      nervoso: '- ECG 15, Pupilas isocóricas e foto reativas. Força muscular preservada nos 4 membros (grau 5). Mímica facial preservada. Movimento extraocular preservado. Sensibilidade sem alterações.',
      orofaringe: '- A mucosa bucal está úmida e corada, sem lesões visíveis. As amígdalas são simétricas, sem sinais de hiperemia ou exsudato. Os arcos palatinos estão sem alterações, e a faringe está clara, sem edema ou secreção purulenta.',
      otoscopia: '- As orelhas externas estão sem alterações visíveis. O conduto auditivo externo está livre, sem secreções ou corpos estranhos. O tímpano apresenta coloração normal, está intacto, sem sinais de otite ou perfuração, e o refletor da luz está bem definido em ambos os ouvidos.'
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
