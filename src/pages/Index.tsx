import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SimplifiedConsultationForm } from "@/components/SimplifiedConsultationForm";
import { ProcessingLoader } from "@/components/ProcessingLoader";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { sendToWebhook } from "@/utils/webhookService";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [activeView, setActiveView] = useState<'home' | 'consultation' | 'processing' | 'results'>('home');
  const [webhookResponse, setWebhookResponse] = useState<string>('');

  const startNewConsultation = () => {
    setActiveView('consultation');
  };

  const handleConsultationComplete = async (consultationData: any) => {
    try {
      setActiveView('processing');

      // Send to webhook and wait for response
      const result = await sendToWebhook(consultationData);

      if (result && result.analysisText) {
        setWebhookResponse(result.analysisText);
        setActiveView('results');
        
        toast({
          title: "Análise concluída",
          description: "Dados processados com sucesso!",
        });
      } else {
        throw new Error('Resposta inválida do webhook');
      }

    } catch (error) {
      console.error('Error processing consultation:', error);
      
      toast({
        title: "Erro ao processar",
        description: "Não foi possível processar a consulta. Tente novamente.",
        variant: "destructive",
      });
      
      setActiveView('home');
    }
  };

  const handleNewConsultation = () => {
    setWebhookResponse('');
    setActiveView('home');
  };

  if (activeView === 'consultation') {
    return (
      <SimplifiedConsultationForm 
        onComplete={handleConsultationComplete}
        onCancel={() => setActiveView('home')}
      />
    );
  }

  if (activeView === 'processing') {
    return <ProcessingLoader />;
  }

  if (activeView === 'results') {
    return (
      <ResultsDisplay 
        content={webhookResponse}
        onNewConsultation={handleNewConsultation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">A3M for Helpem</h1>
        <p className="text-xl text-gray-600 mb-12">Sistema Simplificado de Consulta Médica</p>
        
        <Button 
          onClick={startNewConsultation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-8 text-2xl rounded-xl shadow-lg transform transition hover:scale-105"
          size="lg"
        >
          <Plus className="w-8 h-8 mr-3" />
          Nova Consulta
        </Button>
      </div>
    </div>
  );
};

export default Index;
