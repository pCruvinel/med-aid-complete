
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ConditionalField } from "./types";

interface HDAStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const HDAStep = ({ value, onChange }: HDAStepProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">História da Doença Atual (HDA) *</h3>
    <Textarea
      placeholder="Descreva a história da doença atual..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-32"
    />
  </div>
);

interface ConditionalFieldStepProps {
  title: string;
  field: ConditionalField;
  onUpdate: (key: keyof ConditionalField, value: string) => void;
  placeholder?: string;
}

export const ConditionalFieldStep = ({ 
  title, 
  field, 
  onUpdate, 
  placeholder = "Especifique..." 
}: ConditionalFieldStepProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">{title} *</h3>
    <RadioGroup 
      value={field.tem} 
      onValueChange={(value) => onUpdate('tem', value)}
      className="flex gap-6"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="sim" id={`${title.toLowerCase()}-sim`} />
        <Label htmlFor={`${title.toLowerCase()}-sim`} className="cursor-pointer">SIM</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="nao" id={`${title.toLowerCase()}-nao`} />
        <Label htmlFor={`${title.toLowerCase()}-nao`} className="cursor-pointer">NÃO</Label>
      </div>
    </RadioGroup>
    
    {field.tem === 'sim' && (
      <div>
        <Label htmlFor={`${title.toLowerCase()}-spec`}>Especificar:</Label>
        <Textarea
          id={`${title.toLowerCase()}-spec`}
          placeholder={placeholder}
          value={field.especificar}
          onChange={(e) => onUpdate('especificar', e.target.value)}
          className="mt-2"
        />
      </div>
    )}
  </div>
);

interface SimpleTextStepProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  minHeight?: string;
}

export const SimpleTextStep = ({ 
  title, 
  value, 
  onChange, 
  placeholder, 
  required = true,
  minHeight = "min-h-32"
}: SimpleTextStepProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">{title} {required && '*'}</h3>
    <Textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={minHeight}
    />
  </div>
);
