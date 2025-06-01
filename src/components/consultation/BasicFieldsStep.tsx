
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConditionalField } from "./types";
import { SelectionButton } from "./SelectionButtons";

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
    
    <div className="space-y-3">
      <SelectionButton
        value="sim"
        currentValue={field.tem}
        onChange={(value) => onUpdate('tem', value)}
        label="SIM"
        description={`O paciente tem ${title.toLowerCase()}`}
      />
      <SelectionButton
        value="nao"
        currentValue={field.tem}
        onChange={(value) => onUpdate('tem', value)}
        label="NÃO"
        description={`O paciente não tem ${title.toLowerCase()}`}
      />
    </div>
    
    {field.tem === 'sim' && (
      <div className="mt-4">
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
