
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SinaisVitais } from "./types";

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
      
      <div>
        <Label>Alteração do Nível de Consciência</Label>
        <RadioGroup 
          value={sinaisVitais.alteracaoConsciencia} 
          onValueChange={(value) => onUpdate('alteracaoConsciencia', value)}
          className="flex gap-6 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sim" id="consciencia-sim" />
            <Label htmlFor="consciencia-sim" className="cursor-pointer">SIM</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao" id="consciencia-nao" />
            <Label htmlFor="consciencia-nao" className="cursor-pointer">NÃO</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
