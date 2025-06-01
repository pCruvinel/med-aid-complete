
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinishStepProps {
  onFinish: () => void;
  isSending: boolean;
}

export const FinishStep = ({ onFinish, isSending }: FinishStepProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">Consulta Finalizada</CardTitle>
            <Button 
              onClick={onFinish} 
              disabled={isSending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enviar para Processamento
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Revise as informações e clique em "Enviar para Processamento" para finalizar a consulta.</p>
        </CardContent>
      </Card>
    </div>
  );
};
