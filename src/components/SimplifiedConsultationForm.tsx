import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Loader2, Pause, Play } from "lucide-react";
import { useRecording } from "@/hooks/useRecording";
import { toast } from "@/hooks/use-toast";
import { SelectionButton } from "./consultation/SelectionButtons";

interface SimplifiedConsultationFormProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

interface SinaisVitais {
  pa1: string;
  pa2: string;
  fc: string;
  fr: string;
  hgt: string;
  temperatura: string;
  alteracaoConsciencia: string;
  dor: string;
}

export const SimplifiedConsultationForm = ({ onComplete, onCancel }: SimplifiedConsultationFormProps) => {
  const { isRecording, isPaused, recordingTime, startRecording, stopRecording, pauseRecording, resumeRecording, formatTime } = useRecording();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Dados do Paciente
    idade: '',
    sexo: '',
    
    // Observações
    observacoes: ''
  });

  // Sinais vitais como no sistema original
  const [sinaisVitais, setSinaisVitais] = useState<SinaisVitais>({
    pa1: '',
    pa2: '',
    fc: '',
    fr: '',
    hgt: '',
    temperatura: '',
    alteracaoConsciencia: '',
    dor: ''
  });

  // Start recording automatically when component mounts
  useEffect(() => {
    const initRecording = async () => {
      try {
        await startRecording();
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: "Erro ao iniciar gravação",
          description: "Não foi possível iniciar a gravação. Verifique as permissões do microfone.",
          variant: "destructive",
        });
      }
    };
    
    initRecording();
    
    // Cleanup on unmount
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, []);

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.idade || !formData.sexo) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha idade e sexo do paciente.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Stop recording and get audio
      const audioBlob = await stopRecording();
      
      // Prepare data for webhook
      const consultationData = {
        ...formData,
        sinaisVitais,
        audioBlob,
        recordingDuration: recordingTime,
        timestamp: new Date().toISOString()
      };
      
      onComplete(consultationData);
      
    } catch (error) {
      console.error('Error submitting consultation:', error);
      toast({
        title: "Erro ao finalizar",
        description: "Não foi possível finalizar a consulta. Tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSinaisVitais = (field: keyof SinaisVitais, value: string) => {
    setSinaisVitais(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Recording Status */}
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : isPaused ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="text-lg font-semibold">
                    {isRecording ? (isPaused ? 'Gravação Pausada' : 'Gravando...') : 'Gravação Finalizada'}
                  </p>
                  <p className="text-sm text-gray-600">{formatTime(recordingTime)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {isRecording && (
                  <Button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Retomar</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pausar</span>
                      </>
                    )}
                  </Button>
                )}
                <Mic className={`w-6 h-6 ${isRecording && !isPaused ? 'text-red-500' : isPaused ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle>Dados da Consulta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Dados do Paciente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados do Paciente</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="idade">Idade *</Label>
                  <Input
                    id="idade"
                    type="number"
                    value={formData.idade}
                    onChange={(e) => updateFormData('idade', e.target.value)}
                    placeholder="Ex: 45"
                  />
                </div>
                
                <div>
                  <Label className="text-base font-medium">Sexo *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <SelectionButton
                      value="M"
                      currentValue={formData.sexo}
                      onChange={(value) => updateFormData('sexo', value)}
                      label="Masculino"
                    />
                    <SelectionButton
                      value="F"
                      currentValue={formData.sexo}
                      onChange={(value) => updateFormData('sexo', value)}
                      label="Feminino"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sinais Vitais */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Exame Físico - Sinais Vitais</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PA (mmHg)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="120"
                      value={sinaisVitais.pa1}
                      onChange={(e) => updateSinaisVitais('pa1', e.target.value)}
                    />
                    <span>/</span>
                    <Input
                      placeholder="80"
                      value={sinaisVitais.pa2}
                      onChange={(e) => updateSinaisVitais('pa2', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>FC (BPM)</Label>
                  <Input
                    placeholder="72"
                    value={sinaisVitais.fc}
                    onChange={(e) => updateSinaisVitais('fc', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>FR (IRPM)</Label>
                  <Input
                    placeholder="16"
                    value={sinaisVitais.fr}
                    onChange={(e) => updateSinaisVitais('fr', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>HGT (mg/dl)</Label>
                  <Input
                    placeholder="90"
                    value={sinaisVitais.hgt}
                    onChange={(e) => updateSinaisVitais('hgt', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Temperatura (°C)</Label>
                  <Input
                    placeholder="36.5"
                    value={sinaisVitais.temperatura}
                    onChange={(e) => updateSinaisVitais('temperatura', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Dor (0-10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="0"
                    value={sinaisVitais.dor}
                    onChange={(e) => updateSinaisVitais('dor', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-base font-medium">Alteração do Nível de Consciência</Label>
                <div className="grid grid-cols-2 gap-3">
                  <SelectionButton
                    value="sim"
                    currentValue={sinaisVitais.alteracaoConsciencia}
                    onChange={(value) => updateSinaisVitais('alteracaoConsciencia', value)}
                    label="SIM"
                    description="Apresenta alteração do nível de consciência"
                  />
                  <SelectionButton
                    value="nao"
                    currentValue={sinaisVitais.alteracaoConsciencia}
                    onChange={(value) => updateSinaisVitais('alteracaoConsciencia', value)}
                    label="NÃO"
                    description="Não apresenta alteração do nível de consciência"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Observações Adicionais</h3>
              
              <Textarea
                value={formData.observacoes}
                onChange={(e) => updateFormData('observacoes', e.target.value)}
                placeholder="Digite aqui observações complementares sobre a consulta..."
                className="min-h-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.idade || !formData.sexo}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finalizando...
              </>
            ) : (
              'Finalizar Consulta'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}; 