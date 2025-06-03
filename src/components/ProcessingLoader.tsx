import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Mic, Brain, FileText, CheckCircle, Upload, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const ProcessingLoader = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      icon: Upload,
      message: "Enviando dados da consulta...",
      subMessage: "Preparando informações para processamento",
      duration: 3000
    },
    {
      icon: Mic,
      message: "Transcrevendo áudio da consulta...",
      subMessage: "Convertendo voz em texto com alta precisão",
      duration: 8000
    },
    {
      icon: Brain,
      message: "Analisando informações com inteligência artificial...",
      subMessage: "Processando dados clínicos e contexto médico",
      duration: 7000
    },
    {
      icon: Sparkles,
      message: "Gerando análise baseada em áudio e dados...",
      subMessage: "Criando relatório personalizado",
      duration: 6000
    },
    {
      icon: FileText,
      message: "Organizando resultado final...",
      subMessage: "Estruturando informações de forma clara",
      duration: 4000
    },
    {
      icon: CheckCircle,
      message: "Finalizando análise...",
      subMessage: "Preparando resultado para visualização",
      duration: 2000
    }
  ];

  useEffect(() => {
    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    const progressInterval = 100; // Update every 100ms
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-white shadow-2xl border-0 overflow-hidden relative">
        <div className="p-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Processando Consulta
            </h1>
            <p className="text-lg text-gray-600">
              Aguarde enquanto analisamos os dados
            </p>
          </div>

          {/* Animated Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20 animation-delay-2000"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-green-500 rounded-full p-6 shadow-lg transform transition-transform duration-500 hover:scale-105">
                <CurrentIcon className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* Current Step Message */}
          <div className="text-center mb-8">
            <p className="text-xl text-gray-700 font-medium mb-2">
              {steps[currentStep].message}
            </p>
            <p className="text-sm text-gray-500">
              {steps[currentStep].subMessage}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <div className="absolute inset-0 h-3 overflow-hidden rounded-full">
                <div className="h-full bg-gradient-to-r from-blue-400 to-green-400 opacity-30 animate-pulse"></div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              {Math.round(progress)}% concluído
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between items-center max-w-lg mx-auto mb-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={index}
                  className={`flex flex-col items-center transition-all duration-500 ${
                    isActive ? 'scale-110' : 'scale-90'
                  }`}
                >
                  <div
                    className={`rounded-full p-2 transition-all duration-500 shadow-md ${
                      isCompleted
                        ? 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                        : isActive
                        ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white animate-pulse'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600 animate-pulse">Processando...</span>
          </div>

          {/* Informative Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Nossa IA médica está analisando cuidadosamente todos os dados
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Este processo garante a melhor qualidade na análise clínica
            </p>
          </div>
        </div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-green-100 rounded-full opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-50 to-green-50 rounded-full opacity-20 animate-spin" style={{ animationDuration: '20s' }}></div>
        </div>
      </Card>
    </div>
  );
}; 