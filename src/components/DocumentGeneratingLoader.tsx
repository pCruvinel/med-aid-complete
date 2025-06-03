import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, FileText, Printer, FileCheck, Send, PenTool, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DocumentGeneratingLoaderProps {
  patientName?: string;
}

export const DocumentGeneratingLoader = ({ patientName }: DocumentGeneratingLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      icon: Send,
      message: "Enviando dados selecionados...",
      subMessage: "Preparando informações finais para o documento",
      duration: 2000
    },
    {
      icon: PenTool,
      message: "Formatando documento médico...",
      subMessage: "Aplicando padrões de documentação clínica",
      duration: 3000
    },
    {
      icon: Sparkles,
      message: "Gerando PDF personalizado...",
      subMessage: "Criando documento com layout profissional",
      duration: 3000
    },
    {
      icon: FileCheck,
      message: "Validando conteúdo...",
      subMessage: "Verificando completude dos dados",
      duration: 2000
    },
    {
      icon: Printer,
      message: "Preparando para impressão...",
      subMessage: "Otimizando documento para visualização e impressão",
      duration: 2000
    }
  ];

  useEffect(() => {
    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    const progressInterval = 50; // Update every 50ms for smoother animation
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += progressInterval;
      
      // Update progress bar
      const progressPercentage = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(progressPercentage);

      // Calculate current step
      let accumulatedTime = 0;
      for (let i = 0; i < steps.length; i++) {
        accumulatedTime += steps[i].duration;
        if (elapsed <= accumulatedTime) {
          setCurrentStep(i);
          break;
        }
      }
    }, progressInterval);

    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full bg-white shadow-2xl border-0 overflow-hidden relative">
        <div className="p-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Gerando Documento
            </h2>
            {patientName && (
              <p className="text-sm text-gray-600">
                Paciente: <span className="font-medium">{patientName}</span>
              </p>
            )}
          </div>

          {/* Animated Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-30"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 shadow-lg transform transition-transform duration-500">
                <CurrentIcon className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* Current Step Message */}
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700 font-medium mb-1">
              {steps[currentStep].message}
            </p>
            <p className="text-xs text-gray-500">
              {steps[currentStep].subMessage}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="relative">
              <Progress value={progress} className="h-2" />
              <div className="absolute inset-0 h-2 overflow-hidden rounded-full">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 opacity-30 animate-pulse"></div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-1">
              {Math.round(progress)}% concluído
            </p>
          </div>

          {/* Step Indicators - Compact Version */}
          <div className="flex justify-center items-center space-x-2 mb-4">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    isActive ? 'scale-125' : 'scale-100'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-green-500'
                        : isActive
                        ? 'bg-green-400 animate-pulse'
                        : 'bg-gray-300'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600 animate-bounce" />
            <span className="text-sm text-gray-600">Gerando PDF...</span>
          </div>

          {/* Info Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              O documento será aberto automaticamente para impressão
            </p>
          </div>
        </div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-100 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-100 rounded-full opacity-30 animate-pulse animation-delay-2000"></div>
        </div>
      </Card>
    </div>
  );
}; 