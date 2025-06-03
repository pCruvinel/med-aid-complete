import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, Plus, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ResultsDisplayProps {
  content: string;
  onNewConsultation: () => void;
}

export const ResultsDisplay = ({ content, onNewConsultation }: ResultsDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Consulta Médica Copiada!",
        description: "O texto completo da consulta foi copiado para a área de transferência.",
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Error copying text:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-7 h-7 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl">Consulta Médica Gerada</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Documento pronto para uso</p>
                </div>
              </div>
              <Button
                onClick={handleCopy}
                className={`flex items-center space-x-2 px-6 py-3 ${
                  copied 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                size="lg"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copiar Consulta</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-8 min-h-[500px] max-h-[600px] overflow-y-auto">
              <div className="prose prose-gray max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed bg-gray-50 p-6 rounded-lg border">
                  {content}
                </pre>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">💡 Como usar:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Clique em "Copiar Consulta" para copiar todo o texto</li>
                <li>• Cole diretamente no sistema do hospital ou prontuário eletrônico</li>
                <li>• O documento já está formatado e pronto para uso</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={onNewConsultation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            size="lg"
          >
            <Plus className="w-6 h-6 mr-3" />
            Nova Consulta
          </Button>
        </div>
      </div>
    </div>
  );
}; 