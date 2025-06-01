
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Check, Edit, Bot, User, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { consultationService, ConsultationRecord } from "@/services/consultationService";
import { generateFinalDocument } from "@/utils/webhookService";

interface ReviewInterfaceProps {
  consultationId: string;
  onBack: () => void;
  onComplete: () => void;
}

interface ReviewFieldData {
  doctor: string;
  ai: string;
  selected: 'doctor' | 'ai';
}

interface ReviewData {
  hda: ReviewFieldData;
  comorbidades: ReviewFieldData;
  medicacoes: ReviewFieldData;
  alergias: ReviewFieldData;
  hipoteseDiagnostica: ReviewFieldData;
  conduta: ReviewFieldData;
}

export const ReviewInterface = ({ consultationId, onBack, onComplete }: ReviewInterfaceProps) => {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [consultation, setConsultation] = useState<ConsultationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [generatingDocument, setGeneratingDocument] = useState(false);

  useEffect(() => {
    loadConsultationData();
  }, [consultationId]);

  const loadConsultationData = async () => {
    try {
      setLoading(true);
      const consultationData = await consultationService.getConsultationById(consultationId);
      
      if (!consultationData) {
        toast({
          title: "Erro",
          description: "Consulta não encontrada.",
          variant: "destructive",
        });
        onBack();
        return;
      }

      setConsultation(consultationData);

      // Mapear dados originais do médico vs sugestões da IA
      const mappedData: ReviewData = {
        hda: {
          doctor: consultationData.hda_original || 'Não informado',
          ai: consultationData.hda || 'Análise não disponível',
          selected: 'doctor'
        },
        comorbidades: {
          doctor: typeof consultationData.comorbidades_original === 'object' 
            ? consultationData.comorbidades_original?.especificar || 'Não informado'
            : consultationData.comorbidades_original || 'Não informado',
          ai: typeof consultationData.comorbidades === 'object' 
            ? consultationData.comorbidades?.especificar || 'Análise não disponível'
            : consultationData.comorbidades || 'Análise não disponível',
          selected: 'doctor'
        },
        medicacoes: {
          doctor: typeof consultationData.medicacoes_original === 'object' 
            ? consultationData.medicacoes_original?.especificar || 'Não informado'
            : consultationData.medicacoes_original || 'Não informado',
          ai: typeof consultationData.medicacoes === 'object' 
            ? consultationData.medicacoes?.especificar || 'Análise não disponível'
            : consultationData.medicacoes || 'Análise não disponível',
          selected: 'doctor'
        },
        alergias: {
          doctor: typeof consultationData.alergias_original === 'object' 
            ? consultationData.alergias_original?.especificar || 'Não informado'
            : consultationData.alergias_original || 'Não informado',
          ai: typeof consultationData.alergias === 'object' 
            ? consultationData.alergias?.especificar || 'Análise não disponível'
            : consultationData.alergias || 'Análise não disponível',
          selected: 'doctor'
        },
        hipoteseDiagnostica: {
          doctor: consultationData.hipotese_diagnostica_original || 'Não informado',
          ai: consultationData.hipotese_diagnostica || 'Análise não disponível',
          selected: 'doctor'
        },
        conduta: {
          doctor: consultationData.conduta_original || 'Não informado',
          ai: consultationData.conduta || 'Análise não disponível',
          selected: 'doctor'
        }
      };

      setReviewData(mappedData);
    } catch (error) {
      console.error('Error loading consultation:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da consulta.",
        variant: "destructive",
      });
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleFieldSelect = (field: string, source: 'doctor' | 'ai') => {
    if (!reviewData) return;
    
    setReviewData(prev => ({
      ...prev!,
      [field]: { ...prev![field as keyof ReviewData], selected: source }
    }));
  };

  const handleEdit = (field: string, source: 'doctor' | 'ai') => {
    if (!reviewData) return;
    
    const currentText = reviewData[field as keyof ReviewData][source];
    setEditingText(currentText);
    setEditingField(`${field}-${source}`);
  };

  const handleSaveEdit = () => {
    if (!editingField || !reviewData) return;
    
    const [field, source] = editingField.split('-');
    setReviewData(prev => ({
      ...prev!,
      [field]: { 
        ...prev![field as keyof ReviewData], 
        [source]: editingText,
        selected: source as 'doctor' | 'ai'
      }
    }));
    
    setEditingField(null);
    setEditingText("");
  };

  const handleGenerateDocument = async () => {
    if (!reviewData || !consultation) return;

    try {
      setGeneratingDocument(true);

      // Preparar dados finais para o webhook de geração do documento
      const finalData = {
        consultationId,
        patientName: consultation.patient_name,
        consultationType: consultation.consultation_type,
        reviewedData: {
          hda: reviewData.hda.selected === 'doctor' ? reviewData.hda.doctor : reviewData.hda.ai,
          comorbidades: reviewData.comorbidades.selected === 'doctor' ? reviewData.comorbidades.doctor : reviewData.comorbidades.ai,
          medicacoes: reviewData.medicacoes.selected === 'doctor' ? reviewData.medicacoes.doctor : reviewData.medicacoes.ai,
          alergias: reviewData.alergias.selected === 'doctor' ? reviewData.alergias.doctor : reviewData.alergias.ai,
          hipoteseDiagnostica: reviewData.hipoteseDiagnostica.selected === 'doctor' ? reviewData.hipoteseDiagnostica.doctor : reviewData.hipoteseDiagnostica.ai,
          conduta: reviewData.conduta.selected === 'doctor' ? reviewData.conduta.doctor : reviewData.conduta.ai,
        },
        selectedSources: {
          hda: reviewData.hda.selected,
          comorbidades: reviewData.comorbidades.selected,
          medicacoes: reviewData.medicacoes.selected,
          alergias: reviewData.alergias.selected,
          hipoteseDiagnostica: reviewData.hipoteseDiagnostica.selected,
          conduta: reviewData.conduta.selected,
        },
        timestamp: new Date().toISOString()
      };

      console.log('Enviando dados finais para geração do documento:', finalData);
      
      // Chamar o edge function para gerar o documento final
      const result = await generateFinalDocument(finalData);

      if (result.success) {
        toast({
          title: "Documento gerado com sucesso",
          description: "O documento final foi criado e a consulta foi finalizada.",
        });

        onComplete();
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGeneratingDocument(false);
    }
  };

  const renderField = (
    title: string, 
    fieldKey: string, 
    field: ReviewFieldData
  ) => {
    const isEditing = editingField === `${fieldKey}-doctor` || editingField === `${fieldKey}-ai`;
    
    return (
      <Card key={fieldKey} className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Doctor's Response */}
          <div className={`p-4 rounded-lg border-2 transition-all ${
            field.selected === 'doctor' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Sua Resposta</span>
                {field.selected === 'doctor' && (
                  <Badge className="bg-blue-100 text-blue-800 border-0">
                    <Check className="w-3 h-3 mr-1" />
                    Selecionada
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFieldSelect(fieldKey, 'doctor')}
                  className={field.selected === 'doctor' ? 'bg-blue-100' : ''}
                >
                  Usar Esta
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(fieldKey, 'doctor')}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {editingField === `${fieldKey}-doctor` ? (
              <div className="space-y-2">
                <Textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="min-h-20"
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {field.doctor || 'Não informado'}
              </p>
            )}
          </div>

          {/* AI's Response */}
          <div className={`p-4 rounded-lg border-2 transition-all ${
            field.selected === 'ai' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-green-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Sugestão da IA</span>
                {field.selected === 'ai' && (
                  <Badge className="bg-green-100 text-green-800 border-0">
                    <Check className="w-3 h-3 mr-1" />
                    Selecionada
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFieldSelect(fieldKey, 'ai')}
                  className={field.selected === 'ai' ? 'bg-green-100' : ''}
                >
                  Usar Esta
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(fieldKey, 'ai')}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {editingField === `${fieldKey}-ai` ? (
              <div className="space-y-2">
                <Textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="min-h-20"
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {field.ai || 'Não informado'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dados da consulta...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reviewData || !consultation) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados da consulta.</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Revisão da Consulta</h1>
              <p className="text-gray-600">
                Paciente: {consultation.patient_name} • {consultation.consultation_type}
              </p>
              <p className="text-sm text-gray-500">
                Compare suas respostas com as sugestões da IA e escolha a melhor opção
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleGenerateDocument}
            disabled={generatingDocument}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {generatingDocument ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Gerar Documento
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Review Fields */}
      <div className="space-y-6">
        {renderField("História da Doença Atual (HDA)", "hda", reviewData.hda)}
        {renderField("Comorbidades", "comorbidades", reviewData.comorbidades)}
        {renderField("Medicações de Uso Contínuo", "medicacoes", reviewData.medicacoes)}
        {renderField("Alergias", "alergias", reviewData.alergias)}
        {renderField("Hipótese Diagnóstica", "hipoteseDiagnostica", reviewData.hipoteseDiagnostica)}
        {renderField("Conduta", "conduta", reviewData.conduta)}
      </div>

      {/* Summary */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-blue-900">Resumo da Revisão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Respostas suas selecionadas:</span>
              <span className="ml-2 text-blue-600">
                {Object.values(reviewData).filter(field => field.selected === 'doctor').length}
              </span>
            </div>
            <div>
              <span className="font-medium">Sugestões da IA selecionadas:</span>
              <span className="ml-2 text-green-600">
                {Object.values(reviewData).filter(field => field.selected === 'ai').length}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Clique em "Gerar Documento" quando estiver satisfeito com todas as seleções.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
