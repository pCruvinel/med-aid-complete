
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PatientNameStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const PatientNameStep = ({ value, onChange }: PatientNameStepProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Nome do Paciente *</h3>
      <div className="space-y-2">
        <Label htmlFor="patient-name">Nome completo do paciente</Label>
        <Input
          id="patient-name"
          type="text"
          placeholder="Digite o nome completo do paciente..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
};
