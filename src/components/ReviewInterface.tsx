import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Check, Edit, Bot, User, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { consultationService, ConsultationRecord, AiAnalysisRecord } from "@/services/consultationService";
import { generateAndSaveDocument } from "@/utils/documentService";
import { useReviewWebhook } from "@/hooks/useReviewWebhook";
import { DocumentGeneratingLoader } from "./DocumentGeneratingLoader";

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
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [generatingDocument, setGeneratingDocument] = useState(false);
  
  const { processWebhookPayload, loading: webhookLoading, error: webhookError, resetError } = useReviewWebhook();

  useEffect(() => {
    loadConsultationData();
  }, [consultationId]);

  const extractFieldValue = (data: any, fieldName: string): string => {
    if (!data) {
      console.log(`${fieldName}: dados não encontrados`);
      return 'Não informado';
    }
    
    if (typeof data === 'string') {
      const result = data.trim() || 'Não informado';
      console.log(`${fieldName} (string):`, result);
      return result;
    }
    
    if (typeof data === 'object') {
      if (data.tem === 'não' || data.tem === '' || !data.especificar || data.especificar === '') {
        console.log(`${fieldName} (object - sem dados):`, 'Não informado');
        return 'Não informado';
      }
      const result = data.especificar || 'Não informado';
      console.log(`${fieldName} (object):`, result);
      return result;
    }
    
    console.log(`${fieldName} (other):`, 'Não informado');
    return 'Não informado';
  };

  const loadConsultationData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados da consulta
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

      // Carregar análise da IA
      const aiAnalysisData = await consultationService.getAiAnalysis(consultationId);

      console.log('=== DADOS DA CONSULTA ===');
      console.log('Consulta completa:', consultationData);
      console.log('Análise da IA:', aiAnalysisData);
      console.log('Status:', consultationData.status);

      setConsultation(consultationData);
      setAiAnalysis(aiAnalysisData);

      // Mapear dados originais do médico vs sugestões da IA usando a nova estrutura
      const mappedData: ReviewData = {
        hda: {
          doctor: extractFieldValue(consultationData.hda_original, 'HDA original'),
          ai: extractFieldValue(aiAnalysisData?.hda_ai, 'HDA IA'),
          selected: 'doctor'
        },
        comorbidades: {
          doctor: extractFieldValue(consultationData.comorbidades_original, 'Comorbidades original'),
          ai: extractFieldValue(aiAnalysisData?.comorbidades_ai, 'Comorbidades IA'),
          selected: 'doctor'
        },
        medicacoes: {
          doctor: extractFieldValue(consultationData.medicacoes_original, 'Medicações original'),
          ai: extractFieldValue(aiAnalysisData?.medicacoes_ai, 'Medicações IA'),
          selected: 'doctor'
        },
        alergias: {
          doctor: extractFieldValue(consultationData.alergias_original, 'Alergias original'),
          ai: extractFieldValue(aiAnalysisData?.alergias_ai, 'Alergias IA'),
          selected: 'doctor'
        },
        hipoteseDiagnostica: {
          doctor: extractFieldValue(consultationData.hipotese_diagnostica_original, 'Hipótese original'),
          ai: extractFieldValue(aiAnalysisData?.hipotese_diagnostica_ai, 'Hipótese IA'),
          selected: 'doctor'
        },
        conduta: {
          doctor: extractFieldValue(consultationData.conduta_original, 'Conduta original'),
          ai: extractFieldValue(aiAnalysisData?.conduta_ai, 'Conduta IA'),
          selected: 'doctor'
        }
      };

      console.log('=== DADOS MAPEADOS PARA INTERFACE ===');
      console.log('ReviewData mapeada:', mappedData);

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

  const handleWebhookRefresh = async () => {
    // Exemplo de payload do webhook - em produção isso viria do webhook real
    const mockWebhookPayload = {
      id: aiAnalysis?.id || "sample-analysis-id",
      consultation_id: consultationId
    };

    const refreshedAnalysis = await processWebhookPayload(mockWebhookPayload);
    if (refreshedAnalysis) {
      setAiAnalysis(refreshedAnalysis);
      await loadConsultationData(); // Recarregar dados completos
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
    if (!reviewData || !consultation || !aiAnalysis) return;

    try {
      setGeneratingDocument(true);

      // Preparar dados selecionados para o webhook de geração do documento
      const selectedData = {
        id_consulta: consultationId,
        id_analysis: aiAnalysis.id,
        dados_selecionados: {
          hda: reviewData.hda.selected === 'doctor' ? reviewData.hda.doctor : reviewData.hda.ai,
          comorbidades: reviewData.comorbidades.selected === 'doctor' ? reviewData.comorbidades.doctor : reviewData.comorbidades.ai,
          medicacoes: reviewData.medicacoes.selected === 'doctor' ? reviewData.medicacoes.doctor : reviewData.medicacoes.ai,
          alergias: reviewData.alergias.selected === 'doctor' ? reviewData.alergias.doctor : reviewData.alergias.ai,
          hipotese_diagnostica: reviewData.hipoteseDiagnostica.selected === 'doctor' ? reviewData.hipoteseDiagnostica.doctor : reviewData.hipoteseDiagnostica.ai,
          conduta: reviewData.conduta.selected === 'doctor' ? reviewData.conduta.doctor : reviewData.conduta.ai,
        }
      };

      console.log('Enviando dados para geração do documento:', selectedData);
      
      // Chamar o novo webhook para gerar o documento
      const result = await generateAndSaveDocument(selectedData);

      if (result && result.success) {
        console.log('Documento gerado e salvo com sucesso:', result);
        
        toast({
          title: "Documento gerado com sucesso",
          description: "O documento foi aberto em uma nova janela para impressão.",
        });

        // Atualizar status da consulta para completed
        await consultationService.updateConsultationStatus(consultationId, 'completed');

        onComplete();
      } else {
        throw new Error('Falha ao gerar documento');
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
    const hasAiData = field.ai !== 'Não informado' && field.ai !== 'Análise não disponível';
    
    return (
      <Card key={fieldKey} className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
            {title}
            {!hasAiData && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                <AlertCircle className="w-3 h-3 mr-1" />
                IA não processou
              </Badge>
            )}
          </CardTitle>
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
                {field.doctor}
              </p>
            )}
          </div>

          {/* AI's Response */}
          <div className={`p-4 rounded-lg border-2 transition-all ${
            field.selected === 'ai' 
              ? 'border-green-500 bg-green-50' 
              : hasAiData 
                ? 'border-gray-200 hover:border-green-300'
                : 'border-gray-100 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Bot className={`w-4 h-4 ${hasAiData ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${hasAiData ? 'text-green-600' : 'text-gray-500'}`}>
                  Sugestão
                </span>
                {field.selected === 'ai' && hasAiData && (
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
                  disabled={!hasAiData}
                >
                  Usar Esta
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(fieldKey, 'ai')}
                  disabled={!hasAiData}
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
              <p className={`text-sm whitespace-pre-wrap ${hasAiData ? 'text-gray-700' : 'text-gray-500 italic'}`}>
                {field.ai}
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

  // Verificar se a consulta ainda está sendo processada
  if (consultation.status === 'generating-analysis') {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Esta consulta ainda está em processamento...</p>
            <p className="text-sm text-gray-500 mt-2">
              Isso pode levar alguns minutos. A página será atualizada automaticamente.
            </p>
            <Button onClick={onBack} variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Lista
            </Button>
          </div>
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
                Compare as respostas originais com as sugestões e escolha a melhor opção
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleWebhookRefresh}
              disabled={webhookLoading}
              variant="outline"
              size="sm"
            >
              {webhookLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Atualizar IA
            </Button>
            
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

        {webhookError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{webhookError}</span>
              </div>
              <Button onClick={resetError} variant="ghost" size="sm">
                Fechar
              </Button>
            </div>
          </div>
        )}
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
              <span className="font-medium">Respostas originais selecionadas:</span>
              <span className="ml-2 text-blue-600">
                {Object.values(reviewData).filter(field => field.selected === 'doctor').length}
              </span>
            </div>
            <div>
              <span className="font-medium">Sugestões selecionadas:</span>
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

      {/* Document Generating Loader */}
      {generatingDocument && (
        <DocumentGeneratingLoader patientName={consultation.patient_name} />
      )}
    </div>
  );
};
