
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, CheckCircle, FileText, Loader2, Brain } from "lucide-react";
import { ConsultationForm } from "@/components/ConsultationForm";
import { ReviewInterface } from "@/components/ReviewInterface";
import { useConsultations } from "@/hooks/useConsultations";
import { consultationService } from "@/services/consultationService";
import { processConsultationAnalysis } from "@/utils/webhookService";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'consultation' | 'review'>('dashboard');
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);
  const { consultations, loading, updateConsultationStatus, addConsultation, updateConsultation } = useConsultations();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating-analysis':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'pending-review':
        return <FileText className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'generating-analysis':
        return <Brain className="w-4 h-4 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'Em andamento';
      case 'pending-review':
        return 'Aguardando revisão';
      case 'completed':
        return 'Finalizada';
      case 'generating-analysis':
        return 'Gerando análise';
      default:
        return status;
    }
  };

  const startNewConsultation = () => {
    setActiveView('consultation');
  };

  const openReview = (consultationId: string) => {
    setSelectedConsultation(consultationId);
    setActiveView('review');
  };

  const handleConsultationComplete = async (consultationData: any) => {
    try {
      const savedConsultation = await consultationService.createConsultation(
        consultationData,
        consultationData.recordingDuration || 0
      );

      // Save audio if available
      if (consultationData.audioBlob) {
        await consultationService.saveAudioRecording(savedConsultation.id, consultationData.audioBlob);
      }

      addConsultation(savedConsultation);
      setActiveView('dashboard');

      toast({
        title: "Consulta salva",
        description: "A consulta foi salva e está sendo analisada pela IA.",
      });

      // Iniciar processamento em background
      processConsultationAnalysis(savedConsultation.id, consultationData)
        .then(() => {
          updateConsultation(savedConsultation.id, { status: 'pending-review' });
          toast({
            title: "Análise concluída",
            description: "A análise da IA foi concluída. A consulta está pronta para revisão.",
          });
        })
        .catch((error) => {
          console.error('Error in analysis processing:', error);
          updateConsultation(savedConsultation.id, { status: 'pending-review' });
          toast({
            title: "Análise parcial",
            description: "Houve um problema na análise automática, mas a consulta está disponível para revisão manual.",
            variant: "destructive",
          });
        });

    } catch (error) {
      console.error('Error saving consultation:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a consulta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (activeView === 'consultation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <ConsultationForm 
          onComplete={handleConsultationComplete}
          onCancel={() => setActiveView('dashboard')}
        />
      </div>
    );
  }

  if (activeView === 'review' && selectedConsultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <ReviewInterface 
          consultationId={selectedConsultation}
          onBack={() => setActiveView('dashboard')}
          onComplete={() => {
            updateConsultationStatus(selectedConsultation, 'completed');
            setActiveView('dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">A3 Medical Assistant</h1>
              <p className="text-lg text-gray-600">Otimização inteligente da documentação clínica</p>
            </div>
            <Button 
              onClick={startNewConsultation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Consulta
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : consultations.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Gerando Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : consultations.filter(c => c.status === 'generating-analysis').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Aguardando Revisão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : consultations.filter(c => c.status === 'pending-review').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Finalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : consultations.filter(c => c.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consultations List */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Consultas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : consultations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma consulta encontrada</p>
                  <p className="text-sm">Clique em "Nova Consulta" para começar</p>
                </div>
              ) : (
                consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {consultation.patient_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{consultation.patient_name}</h3>
                        <p className="text-sm text-gray-600">{consultation.consultation_type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(consultation.created_at).toLocaleDateString('pt-BR')} às {new Date(consultation.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={`${getStatusColor(consultation.status)} border-0`}>
                        {getStatusIcon(consultation.status)}
                        <span className="ml-1">{getStatusText(consultation.status)}</span>
                      </Badge>
                      
                      {consultation.status === 'pending-review' && (
                        <Button 
                          onClick={() => openReview(consultation.id)}
                          variant="outline" 
                          size="sm"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          Revisar
                        </Button>
                      )}
                      
                      {consultation.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-green-200 text-green-600 hover:bg-green-50"
                        >
                          Ver Documento
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
