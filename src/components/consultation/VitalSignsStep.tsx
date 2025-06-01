
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SinaisVitais } from "./types";
import { SelectionButton } from "./SelectionButtons";

interface VitalSignsStepProps {
  sinaisVitais: SinaisVitais;
  onUpdate: (field: keyof SinaisVitais, value: string) => void;
}

export const VitalSignsStep = ({ sinaisVitais, onUpdate }: VitalSignsStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Exame Físico - Sinais Vitais</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>PA (mmHg)</Label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="120"
              value={sinaisVitais.pa1}
              onChange={(e) => onUpdate('pa1', e.target.value)}
            />
            <span>/</span>
            <Input
              placeholder="80"
              value={sinaisVitais.pa2}
              onChange={(e) => onUpdate('pa2', e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label>FC (BPM)</Label>
          <Input
            placeholder="72"
            value={sinaisVitais.fc}
            onChange={(e) => onUpdate('fc', e.target.value)}
          />
        </div>
        
        <div>
          <Label>FR (IRPM)</Label>
          <Input
            placeholder="16"
            value={sinaisVitais.fr}
            onChange={(e) => onUpdate('fr', e.target.value)}
          />
        </div>
        
        <div>
          <Label>HGT (mg/dl)</Label>
          <Input
            placeholder="90"
            value={sinaisVitais.hgt}
            onChange={(e) => onUpdate('hgt', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Temperatura (°C)</Label>
          <Input
            placeholder="36.5"
            value={sinaisVitais.temperatura}
            onChange={(e) => onUpdate('temperatura', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Dor (0-10)</Label>
          <Input
            type="number"
            min="0"
            max="10"
            placeholder="0"
            value={sinaisVitais.dor}
            onChange={(e) => onUpdate('dor', e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <Label className="text-base font-medium">Alteração do Nível de Consciência</Label>
        <div className="space-y-3">
          <SelectionButton
            value="sim"
            currentValue={sinaisVitais.alteracaoConsciencia}
            onChange={(value) => onUpdate('alteracaoConsciencia', value)}
            label="SIM"
            description="O paciente apresenta alteração do nível de consciência"
          />
          <SelectionButton
            value="nao"
            currentValue={sinaisVitais.alteracaoConsciencia}
            onChange={(value) => onUpdate('alteracaoConsciencia', value)}
            label="NÃO"
            description="O paciente não apresenta alteração do nível de consciência"
          />
        </div>
      </div>
    </div>
  );
};
