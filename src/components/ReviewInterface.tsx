import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Check, Edit, Bot, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReviewInterfaceProps {
  consultationId: string;
  onBack: () => void;
  onComplete: () => void;
}

export const ReviewInterface = ({ consultationId, onBack, onComplete }: ReviewInterfaceProps) => {
  // Mock data - in real app this would come from API
  const [reviewData, setReviewData] = useState({
    hda: {
      doctor: "Paciente de 45 anos, sexo masculino, com quadro de dor abdominal há 3 dias.",
      ai: "Paciente masculino, 45 anos, apresenta dor abdominal em região epigástrica há 3 dias, de início gradual, intensidade 7/10, piora com alimentação, associada a náuseas e vômitos. Nega febre, alterações urinárias ou intestinais.",
      selected: "ai"
    },
    comorbidades: {
      doctor: "Diabetes mellitus tipo 2, hipertensão arterial",
      ai: "Diabetes mellitus tipo 2 há 10 anos em uso de metformina, hipertensão arterial sistêmica há 5 anos em uso de losartana 50mg/dia, com bom controle pressórico.",
      selected: "ai"
    },
    medicacoes: {
      doctor: "Metformina 850mg 2x/dia, Losartana 50mg 1x/dia",
      ai: "Metformina 850mg via oral 2 vezes ao dia, Losartana 50mg via oral 1 vez ao dia pela manhã.",
      selected: "doctor"
    },
    alergias: {
      doctor: "Nega alergias medicamentosas",
      ai: "Paciente nega alergias medicamentosas conhecidas ou reações adversas a medicamentos.",
      selected: "ai"
    },
    hipoteseDiagnostica: {
      doctor: "Dispepsia funcional",
      ai: "Hipótese de dispepsia funcional versus gastrite. Considerar investigação para H. pylori e avaliação endoscópica se não houver melhora com tratamento inicial.",
      selected: "ai"
    },
    conduta: {
      doctor: "Prescrevo omeprazol 40mg 1x/dia por 4 semanas. Orientações dietéticas.",
      ai: "Prescrevo omeprazol 40mg via oral 1 vez ao dia em jejum por 4 semanas. Orientações dietéticas: evitar alimentos gordurosos, condimentados, café e álcool. Retorno em 2 semanas para reavaliação ou antes se persistirem os sintomas. Orientados sinais de alarme: febre, vômitos persistentes, dor abdominal intensa.",
      selected: "ai"
    }
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const handleFieldSelect = (field: string, source: 'doctor' | 'ai') => {
    setReviewData(prev => ({
      ...prev,
      [field]: { ...prev[field as keyof typeof prev], selected: source }
    }));
  };

  const handleEdit = (field: string, source: 'doctor' | 'ai') => {
    const currentText = reviewData[field as keyof typeof reviewData][source];
    setEditingText(currentText);
    setEditingField(`${field}-${source}`);
  };

  const handleSaveEdit = () => {
    if (!editingField) return;
    
    const [field, source] = editingField.split('-');
    setReviewData(prev => ({
      ...prev,
      [field]: { 
        ...prev[field as keyof typeof prev], 
        [source]: editingText,
        selected: source as 'doctor' | 'ai'
      }
    }));
    
    setEditingField(null);
    setEditingText("");
  };

  const handleGenerateDocument = () => {
    // Prepare final data for second webhook
    const finalData = {
      consultationId,
      reviewedData: reviewData,
      timestamp: new Date().toISOString()
    };

    console.log('Sending to document generation webhook:', finalData);
    
    toast({
      title: "Documento sendo gerado",
      description: "O documento final está sendo criado. Você será notificado quando estiver pronto.",
    });

    onComplete();
  };

  const renderField = (
    title: string, 
    fieldKey: string, 
    field: { doctor: string; ai: string; selected: string }
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
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{field.doctor}</p>
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
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{field.ai}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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
              <p className="text-gray-600">Compare suas respostas com as sugestões da IA e escolha a melhor opção</p>
            </div>
          </div>
          
          <Button
            onClick={handleGenerateDocument}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            Gerar Documento
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
