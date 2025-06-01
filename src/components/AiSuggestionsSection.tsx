
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Brain } from "lucide-react";
import { AiAnalysisRecord } from "@/services/consultationService";

interface AiSuggestionsSectionProps {
  aiAnalysis: AiAnalysisRecord | null;
  loading: boolean;
}

export const AiSuggestionsSection = ({ aiAnalysis, loading }: AiSuggestionsSectionProps) => {
  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-blue-900 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            📋 REVISÃO DA CONSULTA - SUGESTÕES DA IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-blue-200 rounded w-3/4"></div>
            <div className="h-4 bg-blue-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiAnalysis) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              📋 REVISÃO DA CONSULTA - SUGESTÕES DA IA
            </div>
            <Badge variant="outline" className="text-red-600 border-red-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Análise não disponível
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 italic">
            Nenhuma análise da IA foi encontrada para esta consulta.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderField = (icon: string, title: string, content: string | null | undefined) => {
    const hasContent = content && content.trim() && content !== 'Não informado';
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900 flex items-center">
          <span className="mr-2">{icon}</span>
          {title}
        </h4>
        <div className={`p-3 rounded-lg border ${hasContent ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
          {hasContent ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">Não processado pela IA</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-900 flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            📋 REVISÃO DA CONSULTA - SUGESTÕES DA IA
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-0">
            Análise Processada
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderField("🔍", "História da Doença Atual (IA)", aiAnalysis.hda_ai)}
        {renderField("🏥", "Comorbidades Identificadas (IA)", aiAnalysis.comorbidades_ai)}
        {renderField("💊", "Medicações de Uso Contínuo (IA)", aiAnalysis.medicacoes_ai)}
        {renderField("⚠️", "Alergias Documentadas (IA)", aiAnalysis.alergias_ai)}
        {renderField("🎯", "Hipóteses Diagnósticas (IA)", aiAnalysis.hipotese_diagnostica_ai)}
        {renderField("📝", "Condutas Recomendadas (IA)", aiAnalysis.conduta_ai)}
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-xs text-blue-700">
            Status: {aiAnalysis.processing_status} • 
            Processado em: {new Date(aiAnalysis.analysis_timestamp).toLocaleString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
