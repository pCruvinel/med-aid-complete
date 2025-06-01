
export interface SepseAdulto {
  sirs: boolean;
  disfuncao: boolean;
  news: boolean;
}

export interface Protocols {
  sepseAdulto: SepseAdulto;
  sepsePediatrica: boolean;
  avc: boolean;
  dorToracica: boolean;
  naoSeAplica: boolean;
}

export interface ConditionalField {
  tem: string;
  especificar: string;
}

export interface SinaisVitais {
  pa1: string;
  pa2: string;
  fc: string;
  fr: string;
  hgt: string;
  temperatura: string;
  alteracaoConsciencia: string;
  dor: string;
}

export interface ExameFisico {
  estadoGeral: string;
  respiratorio: string;
  cardiovascular: string;
  abdome: string;
  extremidades: string;
  nervoso: string;
  orofaringe: string;
  otoscopia: string;
}

export interface ConsultationFormData {
  consultationType: string;
  protocols: Protocols;
  hda: string;
  comorbidades: ConditionalField;
  medicacoes: ConditionalField;
  alergias: ConditionalField;
  sinaisVitais: SinaisVitais;
  exameFisico: ExameFisico;
  hipoteseDiagnostica: string;
  conduta: string;
  examesComplementares: string;
  reavaliacaoMedica: string;
  complementoEvolucao: string;
}

export interface ConsultationFormProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}
