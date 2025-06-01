
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, ArrowLeft, ArrowRight, Save, StopCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRecording } from "@/hooks/useRecording";
import { useConsultationForm } from "@/hooks/useConsultationForm";
import { ConsultationTypeStep } from "./consultation/ConsultationTypeStep";
import { ProtocolsStep } from "./consultation/ProtocolsStep";
import { VitalSignsStep } from "./consultation/VitalSignsStep";
import { ConsultationFormProps } from "./consultation/types";
import { sendToWebhook } from "@/utils/webhookService";

export const ConsultationForm = ({ onComplete, onCancel }: ConsultationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const { formData, updateFormData, updateNestedFormData, updateProtocols, updateSepseAdulto } = useConsultationForm();
  const { isRecording, recordingTime, startRecording, stopRecording, formatTime, getAudioBlob } = useRecording();

  const totalSteps = 12;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    startRecording();
  }, []);

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

  const handleFinish = async () => {
    if (isSending) return;
    
    setIsSending(true);
    
    try {
      // Stop recording and get the audio blob
      const audioBlob = await stopRecording();
      
      const finalData = {
        ...formData,
        audioBlob,
        recordingDuration: recordingTime,
        timestamp: new Date().toISOString()
      };

      console.log('Sending consultation data to webhook...', finalData);
      
      // Send to webhook
      await sendToWebhook(finalData);
      
      toast({
        title: "Consulta enviada com sucesso",
        description: "Os dados foram enviados para processamento pela IA.",
      });

      onComplete(finalData);
      
    } catch (error) {
      console.error('Error sending consultation:', error);
      toast({
        title: "Erro ao enviar consulta",
        description: "Falha no envio dos dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ConsultationTypeStep 
            value={formData.consultationType}
            onChange={(value) => updateFormData('consultationType', value)}
          />
        );

      case 2:
        return (
          <ProtocolsStep 
            protocols={formData.protocols}
            onUpdateProtocols={updateProtocols}
            onUpdateSepseAdulto={updateSepseAdulto}
          />
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
          <VitalSignsStep 
            sinaisVitais={formData.sinaisVitais}
            onUpdate={(field, value) => updateNestedFormData('sinaisVitais', field, value)}
          />
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

  const getNextStep = () => {
    if (currentStep === 10) {
      if (formData.consultationType === 'reavaliacao') return 11;
      if (formData.consultationType === 'complementacao') return 12;
      return totalSteps + 1;
    }
    if (currentStep === 11 && formData.consultationType === 'reavaliacao') {
      return totalSteps + 1;
    }
    if (currentStep === 12 && formData.consultationType === 'complementacao') {
      return totalSteps + 1;
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
                <Button 
                  onClick={handleFinish} 
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
    }
    setCurrentStep(nextStep);
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button onClick={onCancel} variant="outline" size="sm" disabled={isSending}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Nova Consulta</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isRecording ? (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Gravando: {formatTime(recordingTime)}</span>
                  <Button onClick={stopRecording} size="sm" variant="outline" disabled={isSending}>
                    <StopCircle className="w-4 h-4 mr-1" />
                    Parar
                  </Button>
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Gravação parada</span>
                  <Button onClick={startRecording} size="sm" variant="outline" disabled={isSending}>
                    <Mic className="w-4 h-4 mr-1" />
                    Iniciar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Etapa {currentStep} de {totalSteps}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          onClick={() => setCurrentStep(getPrevStep())}
          disabled={currentStep === 1 || isSending}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex space-x-2">
          {currentStep < totalSteps && getNextStep() <= totalSteps && (
            <Button
              onClick={() => setCurrentStep(getNextStep())}
              disabled={!canProceed() || isSending}
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {(currentStep === totalSteps || getNextStep() > totalSteps) && (
            <Button
              onClick={handleFinish}
              className="bg-green-600 hover:bg-green-700"
              disabled={!canProceed() || isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Finalizar Consulta
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
