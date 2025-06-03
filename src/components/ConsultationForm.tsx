import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useRecording } from "@/hooks/useRecording";
import { useConsultationForm } from "@/hooks/useConsultationForm";

// Import step components
import { PatientNameStep } from "./consultation/PatientNameStep";
import { ConsultationTypeStep } from "./consultation/ConsultationTypeStep";
import { ProtocolsStep } from "./consultation/ProtocolsStep";
import { VitalSignsStep } from "./consultation/VitalSignsStep";
import { ExameFisicoStep } from "./consultation/ExameFisicoStep";
import { HDAStep, ConditionalFieldStep, SimpleTextStep } from "./consultation/BasicFieldsStep";
import { FormHeader } from "./consultation/FormHeader";
import { NavigationButtons } from "./consultation/NavigationButtons";
import { FinishStep } from "./consultation/FinishStep";
import { ConsultationFormProps } from "./consultation/types";

export const ConsultationForm = ({ onComplete, onCancel }: ConsultationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const { formData, updateFormData, updateNestedFormData, updateProtocols, updateSepseAdulto } = useConsultationForm();
  const { isRecording, recordingTime, startRecording, stopRecording, formatTime, getAudioBlob } = useRecording();
  
  // Use refs to maintain stable references for cleanup
  const isRecordingRef = useRef(isRecording);
  const stopRecordingRef = useRef(stopRecording);

  // Update refs when values change
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const totalSteps = 14;
  const progress = (currentStep / totalSteps) * 100;

  // Cleanup function to stop recording when component unmounts ONLY
  useEffect(() => {
    return () => {
      if (isRecordingRef.current) {
        stopRecordingRef.current();
      }
    };
  }, []);

  // Start recording when user begins filling the first field (patient name)
  const handlePatientNameChange = async (value: string) => {
    updateFormData('nomePaciente', value);
    
    // Start recording when user starts typing the patient name for the first time
    if (value.trim() !== '' && !hasStartedRecording && !isRecording) {
      setHasStartedRecording(true);
      await startRecording();
    }
  };

  // Enhanced cancel function to stop recording
  const handleCancel = async () => {
    if (isRecording) {
      await stopRecording();
      toast({
        title: "Gravação interrompida",
        description: "A gravação foi parada devido ao cancelamento da consulta.",
      });
    }
    onCancel();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.nomePaciente.trim() !== '';
      case 2: return formData.consultationType !== '';
      case 4: return formData.hda.trim() !== '';
      case 5: return formData.comorbidades.tem !== '';
      case 6: return formData.medicacoes.tem !== '';
      case 7: return formData.alergias.tem !== '';
      case 10: return formData.hipoteseDiagnostica.trim() !== '';
      case 11: return formData.conduta.trim() !== '';
      default: return true;
    }
  };

  const handleFinish = async () => {
    if (isSending) return;
    
    setIsSending(true);
    
    try {
      // Stop recording and get the audio blob
      const audioBlob = await stopRecording();
      
      // Prepare all data for sending
      const finalData = {
        // Basic info
        nomePaciente: formData.nomePaciente,
        consultationType: formData.consultationType,
        timestamp: new Date().toISOString(),
        recordingDuration: recordingTime,
        
        // Clinical fields
        hda: formData.hda || '',
        hipoteseDiagnostica: formData.hipoteseDiagnostica || '',
        conduta: formData.conduta || '',
        examesComplementares: formData.examesComplementares || '',
        reavaliacaoMedica: formData.reavaliacaoMedica || '',
        complementoEvolucao: formData.complementoEvolucao || '',
        
        // Structured data
        comorbidades: formData.comorbidades,
        medicacoes: formData.medicacoes,
        alergias: formData.alergias,
        sinaisVitais: formData.sinaisVitais,
        exameFisico: formData.exameFisico,
        protocols: formData.protocols,
        
        // Audio
        audioBlob
      };

      console.log('Final data being sent:', {
        nomePaciente: finalData.nomePaciente,
        consultationType: finalData.consultationType,
        hasHda: !!finalData.hda,
        hasHipotese: !!finalData.hipoteseDiagnostica,
        hasConduta: !!finalData.conduta,
        hasAudio: !!finalData.audioBlob,
        recordingDuration: finalData.recordingDuration,
        fieldsCount: Object.keys(finalData).length
      });
      
      // Pass data to parent component - webhook will be called there
      onComplete(finalData);
      
      toast({
        title: "Consulta finalizada",
        description: "Processando os dados...",
      });
      
    } catch (error) {
      console.error('Error preparing consultation data:', error);
      
      toast({
        title: "Erro ao finalizar consulta",
        description: "Falha ao preparar os dados. Tente novamente.",
        variant: "destructive",
      });
      
      setIsSending(false);
    }
    // Note: setIsSending(false) is NOT called here on success
    // because the component will unmount when onComplete is called
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PatientNameStep 
            value={formData.nomePaciente}
            onChange={handlePatientNameChange}
          />
        );

      case 2:
        return (
          <ConsultationTypeStep 
            value={formData.consultationType}
            onChange={(value) => updateFormData('consultationType', value)}
          />
        );

      case 3:
        return (
          <ProtocolsStep 
            protocols={formData.protocols}
            onUpdateProtocols={updateProtocols}
            onUpdateSepseAdulto={updateSepseAdulto}
          />
        );

      case 4:
        return (
          <HDAStep
            value={formData.hda}
            onChange={(value) => updateFormData('hda', value)}
          />
        );

      case 5:
        return (
          <ConditionalFieldStep
            title="Comorbidades"
            field={formData.comorbidades}
            onUpdate={(key, value) => updateNestedFormData('comorbidades', key, value)}
            placeholder="Especifique as comorbidades..."
          />
        );

      case 6:
        return (
          <ConditionalFieldStep
            title="Medicações de Uso Contínuo"
            field={formData.medicacoes}
            onUpdate={(key, value) => updateNestedFormData('medicacoes', key, value)}
            placeholder="Especifique as medicações..."
          />
        );

      case 7:
        return (
          <ConditionalFieldStep
            title="Alergias"
            field={formData.alergias}
            onUpdate={(key, value) => updateNestedFormData('alergias', key, value)}
            placeholder="Especifique as alergias..."
          />
        );

      case 8:
        return (
          <VitalSignsStep 
            sinaisVitais={formData.sinaisVitais}
            onUpdate={(field, value) => updateNestedFormData('sinaisVitais', field, value)}
          />
        );

      case 9:
        return (
          <ExameFisicoStep 
            exameFisico={formData.exameFisico}
            onUpdate={(field, value) => updateNestedFormData('exameFisico', field, value)}
          />
        );

      case 10:
        return (
          <SimpleTextStep
            title="Hipótese Diagnóstica"
            value={formData.hipoteseDiagnostica}
            onChange={(value) => updateFormData('hipoteseDiagnostica', value)}
            placeholder="Descreva a hipótese diagnóstica..."
          />
        );

      case 11:
        return (
          <SimpleTextStep
            title="Conduta"
            value={formData.conduta}
            onChange={(value) => updateFormData('conduta', value)}
            placeholder="Descreva a conduta..."
            minHeight="min-h-40"
          />
        );

      case 12:
        return (
          <SimpleTextStep
            title="Exames Complementares Realizados"
            value={formData.examesComplementares}
            onChange={(value) => updateFormData('examesComplementares', value)}
            placeholder="Descreva os exames laboratoriais e de imagem realizados..."
            required={false}
          />
        );

      case 13:
        if (formData.consultationType === 'reavaliacao') {
          return (
            <SimpleTextStep
              title="Reavaliação Médica"
              value={formData.reavaliacaoMedica}
              onChange={(value) => updateFormData('reavaliacaoMedica', value)}
              placeholder="Descreva a reavaliação médica..."
              required={false}
            />
          );
        }
        return null;

      case 14:
        if (formData.consultationType === 'complementacao') {
          return (
            <SimpleTextStep
              title="Complemento de Evolução"
              value={formData.complementoEvolucao}
              onChange={(value) => updateFormData('complementoEvolucao', value)}
              placeholder="Descreva o complemento de evolução..."
              required={false}
            />
          );
        }
        return null;

      default:
        return null;
    }
  };

  const getNextStep = () => {
    if (currentStep === 12) {
      if (formData.consultationType === 'reavaliacao') return 13;
      if (formData.consultationType === 'complementacao') return 14;
      return totalSteps + 1;
    }
    if (currentStep === 13 && formData.consultationType === 'reavaliacao') {
      return totalSteps + 1;
    }
    if (currentStep === 14 && formData.consultationType === 'complementacao') {
      return totalSteps + 1;
    }
    return currentStep + 1;
  };

  const getPrevStep = () => {
    if (currentStep === 14 && formData.consultationType === 'complementacao') return 12;
    if (currentStep === 13 && formData.consultationType === 'reavaliacao') return 12;
    return currentStep - 1;
  };

  const shouldShowStep = () => {
    if (currentStep === 13 && formData.consultationType !== 'reavaliacao') return false;
    if (currentStep === 14 && formData.consultationType !== 'complementacao') return false;
    return true;
  };

  if (!shouldShowStep()) {
    const nextStep = getNextStep();
    if (nextStep > totalSteps) {
      return (
        <FinishStep 
          onFinish={handleFinish}
          isSending={isSending}
        />
      );
    }
    setCurrentStep(nextStep);
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FormHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        progress={progress}
        isRecording={isRecording}
        recordingTime={recordingTime}
        hasStartedRecording={hasStartedRecording}
        formatTime={formatTime}
        onCancel={handleCancel}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        isSending={isSending}
      />

      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      <NavigationButtons
        currentStep={currentStep}
        totalSteps={totalSteps}
        canProceed={canProceed()}
        isSending={isSending}
        getNextStep={getNextStep}
        getPrevStep={getPrevStep}
        onPrevious={() => setCurrentStep(getPrevStep())}
        onNext={() => setCurrentStep(getNextStep())}
        onFinish={handleFinish}
      />
    </div>
  );
};
