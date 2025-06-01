
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isSending: boolean;
  getNextStep: () => number;
  getPrevStep: () => number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export const NavigationButtons = ({
  currentStep,
  totalSteps,
  canProceed,
  isSending,
  getNextStep,
  getPrevStep,
  onPrevious,
  onNext,
  onFinish
}: NavigationButtonsProps) => {
  const nextStep = getNextStep();
  const isLastStep = currentStep === totalSteps || nextStep > totalSteps;

  return (
    <div className="flex justify-between mt-6">
      <Button
        onClick={onPrevious}
        disabled={currentStep === 1 || isSending}
        variant="outline"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Anterior
      </Button>

      <div className="flex space-x-2">
        {!isLastStep && (
          <Button
            onClick={onNext}
            disabled={!canProceed || isSending}
          >
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        
        {isLastStep && (
          <Button
            onClick={onFinish}
            className="bg-green-600 hover:bg-green-700"
            disabled={!canProceed || isSending}
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
  );
};
