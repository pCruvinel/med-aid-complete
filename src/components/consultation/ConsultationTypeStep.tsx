
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ConsultationTypeStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const ConsultationTypeStep = ({ value, onChange }: ConsultationTypeStepProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tipo de Atendimento</h3>
      <RadioGroup value={value} onValueChange={onChange}>
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
};
