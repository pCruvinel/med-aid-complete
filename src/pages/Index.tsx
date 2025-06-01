
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, CheckCircle, FileText } from "lucide-react";
import { ConsultationForm } from "@/components/ConsultationForm";
import { ReviewInterface } from "@/components/ReviewInterface";

interface Consultation {
  id: string;
  patientName: string;
  date: Date;
  status: 'in-progress' | 'pending-review' | 'completed';
  consultationType?: string;
}

const Index = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'consultation' | 'review'>('dashboard');
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: '1',
      patientName: 'Maria Silva',
      date: new Date('2024-06-01T09:30:00'),
      status: 'pending-review',
      consultationType: 'Avaliação médica'
    },
    {
      id: '2',
      patientName: 'João Santos',
      date: new Date('2024-06-01T10:15:00'),
      status: 'completed',
      consultationType: 'Reavaliação médica'
    }
  ]);
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
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

  const handleConsultationComplete = (consultationData: any) => {
    // Aqui seria enviado para o webhook
    console.log('Consulta finalizada:', consultationData);
    
    // Simular adição da consulta
    const newConsultation: Consultation = {
      id: Date.now().toString(),
      patientName: 'Novo Paciente',
      date: new Date(),
      status: 'pending-review',
      consultationType: consultationData.consultationType || 'Avaliação médica'
    };
    
    setConsultations(prev => [newConsultation, ...prev]);
    setActiveView('dashboard');
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
            // Atualizar status da consulta para completed
            setConsultations(prev => 
              prev.map(c => 
                c.id === selectedConsultation 
                  ? { ...c, status: 'completed' }
                  : c
              )
            );
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{consultations.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Aguardando Revisão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {consultations.filter(c => c.status === 'pending-review').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Finalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {consultations.filter(c => c.status === 'completed').length}
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
              {consultations.length === 0 ? (
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
                          {consultation.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{consultation.patientName}</h3>
                        <p className="text-sm text-gray-600">{consultation.consultationType}</p>
                        <p className="text-xs text-gray-500">
                          {consultation.date.toLocaleDateString('pt-BR')} às {consultation.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
