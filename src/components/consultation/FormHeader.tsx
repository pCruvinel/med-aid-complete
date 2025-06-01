
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RecordingStatus } from "./RecordingStatus";

interface FormHeaderProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  isRecording: boolean;
  recordingTime: number;
  hasStartedRecording: boolean;
  formatTime: (time: number) => string;
  onCancel: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isSending: boolean;
}

export const FormHeader = ({
  currentStep,
  totalSteps,
  progress,
  isRecording,
  recordingTime,
  hasStartedRecording,
  formatTime,
  onCancel,
  onStartRecording,
  onStopRecording,
  isSending
}: FormHeaderProps) => {
  return (
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
          <RecordingStatus
            isRecording={isRecording}
            recordingTime={recordingTime}
            hasStartedRecording={hasStartedRecording}
            formatTime={formatTime}
            onStart={onStartRecording}
            onStop={onStopRecording}
            isSending={isSending}
          />
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
  );
};
