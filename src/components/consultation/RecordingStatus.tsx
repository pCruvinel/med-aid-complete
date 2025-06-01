
import { Mic, MicOff, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingStatusProps {
  isRecording: boolean;
  recordingTime: number;
  hasStartedRecording: boolean;
  formatTime: (time: number) => string;
  onStart: () => void;
  onStop: () => void;
  isSending: boolean;
}

export const RecordingStatus = ({
  isRecording,
  recordingTime,
  hasStartedRecording,
  formatTime,
  onStart,
  onStop,
  isSending
}: RecordingStatusProps) => {
  return (
    <div className="flex items-center space-x-2">
      {isRecording ? (
        <>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Gravando: {formatTime(recordingTime)}</span>
          <Button onClick={onStop} size="sm" variant="outline" disabled={isSending}>
            <StopCircle className="w-4 h-4 mr-1" />
            Parar
          </Button>
        </>
      ) : (
        <>
          <MicOff className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {hasStartedRecording ? "Gravação parada" : "Digite o nome do paciente para iniciar a gravação"}
          </span>
          {hasStartedRecording && (
            <Button onClick={onStart} size="sm" variant="outline" disabled={isSending}>
              <Mic className="w-4 h-4 mr-1" />
              Retomar
            </Button>
          )}
        </>
      )}
    </div>
  );
};
