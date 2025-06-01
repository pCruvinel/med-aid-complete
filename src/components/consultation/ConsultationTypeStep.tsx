
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsultationTypeStepProps {
  value: string;
  onChange: (value: string) => void;
}

const consultationTypes = [
  {
    value: "avaliacao",
    label: "Avaliação Médica",
    description: "Primeira consulta ou avaliação inicial do paciente"
  },
  {
    value: "reavaliacao", 
    label: "Reavaliação Médica",
    description: "Retorno ou reavaliação de caso já em acompanhamento"
  },
  {
    value: "complementacao",
    label: "Complementação de Evolução", 
    description: "Complemento ou adição à evolução médica existente"
  }
];

export const ConsultationTypeStep = ({ value, onChange }: ConsultationTypeStepProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tipo de Atendimento *</h3>
      <div className="space-y-3">
        {consultationTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={cn(
              "w-full p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md",
              "flex items-center justify-between",
              value === type.value
                ? "bg-green-50 border-green-500 text-green-900"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            )}
          >
            <div className="flex-1">
              <div className="font-medium text-base mb-1">{type.label}</div>
              <div className="text-sm opacity-75">{type.description}</div>
            </div>
            {value === type.value && (
              <div className="ml-4 flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
