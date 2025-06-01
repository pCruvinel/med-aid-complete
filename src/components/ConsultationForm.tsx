
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, ArrowLeft, ArrowRight, Save, StopCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ConsultationFormProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export const ConsultationForm = ({ onComplete, onCancel }: ConsultationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [formData, setFormData] = useState({
    consultationType: '',
    protocols: {
      sepseAdulto: { sirs: false, disfuncao: false, news: false },
      sepsePediatrica: false,
      avc: false,
      dorToracica: false,
      naoSeAplica: false
    },
    hda: '',
    comorbidades: { tem: '', especificar: '' },
    medicacoes: { tem: '', especificar: '' },
    alergias: { tem: '', especificar: '' },
    sinaisVitais: {
      pa1: '', pa2: '', fc: '', fr: '', hgt: '', temperatura: '',
      alteracaoConsciencia: '', dor: ''
    },
    exameFisico: {
      estadoGeral: 'Paciente em regular estado geral, lúcido, orientado no tempo e no espaço, acianótico, anictérico e afebril. Pele e mucosas coradas e hidratadas.',
      respiratorio: '- Tórax simétrico, sem deformidades. Expansibilidade pulmonar preservada. - Ausculta: Murmúrio vesicular fisiológico presente bilateral, sem ruídos adventícios.',
      cardiovascular: '- Ausculta: Ritmo cardíaco regular em dois tempos, sem sopros.',
      abdome: '- Abdome plano, ruídos hidroaéreos presentes, normotimpânico, indolor à palpação, sem massa ou visceromegalias, sem sinais de peritonite.',
      extremidades: '- Extremidades superiores e inferiores sem edemas, panturrilhas livres, TEC < 3s. Pulsos palpáveis e simétricos.',
      nervoso: '- ECG 15, Pupilas isocóricas e foto reativas. Força muscular preservada nos 4 membros (grau 5). Mímica facial preservada. Movimento extraocular preservado. Sensibilidade sem alterações.',
      orofaringe: '- A mucosa bucal está úmida e corada, sem lesões visíveis. As amígdalas são simétricas, sem sinais de hiperemia ou exsudato. Os arcos palatinos estão sem alterações, e a faringe está clara, sem edema ou secreção purulenta.',
      otoscopia: '- As orelhas externas estão sem alterações visíveis. O conduto auditivo externo está livre, sem secreções ou corpos estranhos. O tímpano apresenta coloração normal, está intacto, sem sinais de otite ou perfuração, e o refletor da luz está bem definido em ambos os ouvidos.'
    },
    hipoteseDiagnostica: '',
    conduta: '- Oriento sinais de alarme e retorno em caso de não melhora dos sintomas;\n- Prescrito sintomáticos;',
    examesComplementares: '',
    reavaliacaoMedica: '',
    complementoEvolucao: ''
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = 12;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    // Auto-start recording when form opens
    startRecording();
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Gravação iniciada",
        description: "O áudio da consulta está sendo gravado automaticamente.",
      });
    } catch (error) {
      toast({
        title: "Erro ao iniciar gravação",
        description: "Não foi possível acessar o microfone.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent as keyof typeof prev], [field]: value }
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.consultationType !== '';
      case 3: return formData.hda.trim() !== '';
      case 4: return formData.comorbidades.tem !== '';
      case 5: return formData.medicacoes.tem !== '';
      case 6: return formData.alergias.tem !== '';
      case 8: return formData.hipoteseDiagnostica.trim() !== '';
      case 9: return formData.conduta.trim() !== '';
      default: return true;
    }
  };

  const handleFinish = () => {
    stopRecording();
    
    // Prepare final data
    const finalData = {
      ...formData,
      audioBlob: audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current, { type: 'audio/webm' }) : null,
      recordingDuration: recordingTime,
      timestamp: new Date().toISOString()
    };

    console.log('Sending to webhook:', finalData);
    
    toast({
      title: "Consulta finalizada",
      description: "Os dados foram enviados para processamento pela IA.",
    });

    onComplete(finalData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipo de Atendimento</h3>
            <RadioGroup 
              value={formData.consultationType} 
              onValueChange={(value) => updateFormData('consultationType', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="avaliacao" id="avaliacao" />
                <Label htmlFor="avaliacao">Avaliação médica</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reavaliacao" id="reavaliacao" />
                <Label htmlFor="reavaliacao">Reavaliação médica</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complementacao" id="complementacao" />
                <Label htmlFor="complementacao">Complementação evolução</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Protocolos Gerenciados</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Sepse adulto:</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sirs"
                      checked={formData.protocols.sepseAdulto.sirs}
                      onCheckedChange={(checked) => 
                        updateNestedFormData('protocols', 'sepseAdulto', {
                          ...formData.protocols.sepseAdulto,
                          sirs: checked
                        })
                      }
                    />
                    <Label htmlFor="sirs">SIRS ≥ 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="disfuncao"
                      checked={formData.protocols.sepseAdulto.disfuncao}
                      onCheckedChange={(checked) => 
                        updateNestedFormData('protocols', 'sepseAdulto', {
                          ...formData.protocols.sepseAdulto,
                          disfuncao: checked
                        })
                      }
                    />
                    <Label htmlFor="disfuncao">Pelo menos 1 disfunção orgânica</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="news"
                      checked={formData.protocols.sepseAdulto.news}
                      onCheckedChange={(checked) => 
                        updateNestedFormData('protocols', 'sepseAdulto', {
                          ...formData.protocols.sepseAdulto,
                          news: checked
                        })
                      }
                    />
                    <Label htmlFor="news">Escore News ≥ 5</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sepse-pediatrica"
                  checked={formData.protocols.sepsePediatrica}
                  onCheckedChange={(checked) => 
                    updateNestedFormData('protocols', 'sepsePediatrica', checked)
                  }
                />
                <Label htmlFor="sepse-pediatrica">Sepse pediátrica</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="avc"
                  checked={formData.protocols.avc}
                  onCheckedChange={(checked) => 
                    updateNestedFormData('protocols', 'avc', checked)
                  }
                />
                <Label htmlFor="avc">Acidente Vascular Cerebral (AVC)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dor-toracica"
                  checked={formData.protocols.dorToracica}
                  onCheckedChange={(checked) => 
                    updateNestedFormData('protocols', 'dorToracica', checked)
                  }
                />
                <Label htmlFor="dor-toracica">Dor torácica</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="nao-se-aplica"
                  checked={formData.protocols.naoSeAplica}
                  onCheckedChange={(checked) => 
                    updateNestedFormData('protocols', 'naoSeAplica', checked)
                  }
                />
                <Label htmlFor="nao-se-aplica">Não se aplica</Label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">História da Doença Atual (HDA) *</h3>
            <Textarea
              placeholder="Descreva a história da doença atual..."
              value={formData.hda}
              onChange={(e) => updateFormData('hda', e.target.value)}
              className="min-h-32"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Comorbidades *</h3>
            <RadioGroup 
              value={formData.comorbidades.tem} 
              onValueChange={(value) => updateNestedFormData('comorbidades', 'tem', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id="comorbidades-sim" />
                <Label htmlFor="comorbidades-sim">SIM</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id="comorbidades-nao" />
                <Label htmlFor="comorbidades-nao">NÃO</Label>
              </div>
            </RadioGroup>
            
            {formData.comorbidades.tem === 'sim' && (
              <div>
                <Label htmlFor="comorbidades-spec">Especificar:</Label>
                <Textarea
                  id="comorbidades-spec"
                  placeholder="Especifique as comorbidades..."
                  value={formData.comorbidades.especificar}
                  onChange={(e) => updateNestedFormData('comorbidades', 'especificar', e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medicações de Uso Contínuo *</h3>
            <RadioGroup 
              value={formData.medicacoes.tem} 
              onValueChange={(value) => updateNestedFormData('medicacoes', 'tem', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id="medicacoes-sim" />
                <Label htmlFor="medicacoes-sim">SIM</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id="medicacoes-nao" />
                <Label htmlFor="medicacoes-nao">NÃO</Label>
              </div>
            </RadioGroup>
            
            {formData.medicacoes.tem === 'sim' && (
              <div>
                <Label htmlFor="medicacoes-spec">Especificar:</Label>
                <Textarea
                  id="medicacoes-spec"
                  placeholder="Especifique as medicações..."
                  value={formData.medicacoes.especificar}
                  onChange={(e) => updateNestedFormData('medicacoes', 'especificar', e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Alergias *</h3>
            <RadioGroup 
              value={formData.alergias.tem} 
              onValueChange={(value) => updateNestedFormData('alergias', 'tem', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sim" id="alergias-sim" />
                <Label htmlFor="alergias-sim">SIM</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nao" id="alergias-nao" />
                <Label htmlFor="alergias-nao">NÃO</Label>
              </div>
            </RadioGroup>
            
            {formData.alergias.tem === 'sim' && (
              <div>
                <Label htmlFor="alergias-spec">Especificar:</Label>
                <Textarea
                  id="alergias-spec"
                  placeholder="Especifique as alergias..."
                  value={formData.alergias.especificar}
                  onChange={(e) => updateNestedFormData('alergias', 'especificar', e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Exame Físico - Sinais Vitais</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PA (mmHg)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="120"
                    value={formData.sinaisVitais.pa1}
                    onChange={(e) => updateNestedFormData('sinaisVitais', 'pa1', e.target.value)}
                  />
                  <span>/</span>
                  <Input
                    placeholder="80"
                    value={formData.sinaisVitais.pa2}
                    onChange={(e) => updateNestedFormData('sinaisVitais', 'pa2', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>FC (BPM)</Label>
                <Input
                  placeholder="72"
                  value={formData.sinaisVitais.fc}
                  onChange={(e) => updateNestedFormData('sinaisVitais', 'fc', e.target.value)}
                />
              </div>
              
              <div>
                <Label>FR (IRPM)</Label>
                <Input
                  placeholder="16"
                  value={formData.sinaisVitais.fr}
                  onChange={(e) => updateNestedFormData('sinaisVitais', 'fr', e.target.value)}
                />
              </div>
              
              <div>
                <Label>HGT (mg/dl)</Label>
                <Input
                  placeholder="90"
                  value={formData.sinaisVitais.hgt}
                  onChange={(e) => updateNestedFormData('sinaisVitais', 'hgt', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Temperatura (°C)</Label>
                <Input
                  placeholder="36.5"
                  value={formData.sinaisVitais.temperatura}
                  onChange={(e) => updateNestedFormData('sinaisVitais', 'temperatura', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Dor (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0"
                  value={formData.sinaisVitais.dor}
                  onChange={(e) => updateNestedFormData('sinaisVitais', 'dor', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label>Alteração do Nível de Consciência</Label>
              <RadioGroup 
                value={formData.sinaisVitais.alteracaoConsciencia} 
                onValueChange={(value) => updateNestedFormData('sinaisVitais', 'alteracaoConsciencia', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id="consciencia-sim" />
                  <Label htmlFor="consciencia-sim">SIM</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="consciencia-nao" />
                  <Label htmlFor="consciencia-nao">NÃO</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hipótese Diagnóstica *</h3>
            <Textarea
              placeholder="Descreva a hipótese diagnóstica..."
              value={formData.hipoteseDiagnostica}
              onChange={(e) => updateFormData('hipoteseDiagnostica', e.target.value)}
              className="min-h-32"
            />
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Conduta *</h3>
            <Textarea
              placeholder="Descreva a conduta..."
              value={formData.conduta}
              onChange={(e) => updateFormData('conduta', e.target.value)}
              className="min-h-40"
            />
          </div>
        );

      case 10:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Exames Complementares Realizados</h3>
            <Textarea
              placeholder="Descreva os exames laboratoriais e de imagem realizados..."
              value={formData.examesComplementares}
              onChange={(e) => updateFormData('examesComplementares', e.target.value)}
              className="min-h-32"
            />
          </div>
        );

      case 11:
        if (formData.consultationType === 'reavaliacao') {
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reavaliação Médica</h3>
              <Textarea
                placeholder="Descreva a reavaliação médica..."
                value={formData.reavaliacaoMedica}
                onChange={(e) => updateFormData('reavaliacaoMedica', e.target.value)}
                className="min-h-32"
              />
            </div>
          );
        }
        return null;

      case 12:
        if (formData.consultationType === 'complementacao') {
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Complemento de Evolução</h3>
              <Textarea
                placeholder="Descreva o complemento de evolução..."
                value={formData.complementoEvolucao}
                onChange={(e) => updateFormData('complementoEvolucao', e.target.value)}
                className="min-h-32"
              />
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  // Skip steps based on consultation type
  const getNextStep = () => {
    if (currentStep === 10) {
      if (formData.consultationType === 'reavaliacao') return 11;
      if (formData.consultationType === 'complementacao') return 12;
      return totalSteps + 1; // End
    }
    if (currentStep === 11 && formData.consultationType === 'reavaliacao') {
      return totalSteps + 1; // End
    }
    if (currentStep === 12 && formData.consultationType === 'complementacao') {
      return totalSteps + 1; // End
    }
    return currentStep + 1;
  };

  const getPrevStep = () => {
    if (currentStep === 12 && formData.consultationType === 'complementacao') return 10;
    if (currentStep === 11 && formData.consultationType === 'reavaliacao') return 10;
    return currentStep - 1;
  };

  const shouldShowStep = () => {
    if (currentStep === 11 && formData.consultationType !== 'reavaliacao') return false;
    if (currentStep === 12 && formData.consultationType !== 'complementacao') return false;
    return true;
  };

  if (!shouldShowStep()) {
    const nextStep = getNextStep();
    if (nextStep > totalSteps) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">Consulta Finalizada</CardTitle>
                <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Enviar para Processamento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Revise as informações e clique em "Enviar para Processamento" para finalizar a consulta.</p>
            </CardContent>
          </Card>
        </div>
      );
    }
    setCurrentStep(nextStep);
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button onClick={onCancel} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Nova Consulta</h1>
          </div>
          
          {/* Recording Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isRecording ? (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Gravando: {formatTime(recordingTime)}</span>
                  <Button onClick={stopRecording} size="sm" variant="outline">
                    <StopCircle className="w-4 h-4 mr-1" />
                    Parar
                  </Button>
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Gravação parada</span>
                  <Button onClick={startRecording} size="sm" variant="outline">
                    <Mic className="w-4 h-4 mr-1" />
                    Iniciar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Etapa {currentStep} de {totalSteps}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Form Content */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          onClick={() => setCurrentStep(getPrevStep())}
          disabled={currentStep === 1}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex space-x-2">
          {currentStep < totalSteps && getNextStep() <= totalSteps && (
            <Button
              onClick={() => setCurrentStep(getNextStep())}
              disabled={!canProceed()}
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {(currentStep === totalSteps || getNextStep() > totalSteps) && (
            <Button
              onClick={handleFinish}
              className="bg-green-600 hover:bg-green-700"
              disabled={!canProceed()}
            >
              <Save className="w-4 h-4 mr-2" />
              Finalizar Consulta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
