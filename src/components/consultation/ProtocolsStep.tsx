
import { Label } from "@/components/ui/label";
import { Protocols } from "./types";
import { MultiSelectButton } from "./SelectionButtons";

interface ProtocolsStepProps {
  protocols: Protocols;
  onUpdateProtocols: (field: keyof Protocols, value: any) => void;
  onUpdateSepseAdulto: (field: keyof Protocols['sepseAdulto'], value: boolean) => void;
}

export const ProtocolsStep = ({ protocols, onUpdateProtocols, onUpdateSepseAdulto }: ProtocolsStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Protocolos Gerenciados</h3>
      
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-4 block">Sepse adulto:</Label>
          <div className="space-y-3">
            <MultiSelectButton
              checked={protocols.sepseAdulto.sirs}
              onChange={(checked) => onUpdateSepseAdulto('sirs', checked)}
              label="SIRS ≥ 2"
              description="Síndrome da Resposta Inflamatória Sistêmica"
            />
            <MultiSelectButton
              checked={protocols.sepseAdulto.disfuncao}
              onChange={(checked) => onUpdateSepseAdulto('disfuncao', checked)}
              label="Pelo menos 1 disfunção orgânica"
              description="Presença de disfunção em algum órgão ou sistema"
            />
            <MultiSelectButton
              checked={protocols.sepseAdulto.news}
              onChange={(checked) => onUpdateSepseAdulto('news', checked)}
              label="Escore News ≥ 5"
              description="National Early Warning Score elevado"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <MultiSelectButton
            checked={protocols.sepsePediatrica}
            onChange={(checked) => onUpdateProtocols('sepsePediatrica', checked)}
            label="Sepse pediátrica"
            description="Protocolo específico para pacientes pediátricos"
          />
          
          <MultiSelectButton
            checked={protocols.avc}
            onChange={(checked) => onUpdateProtocols('avc', checked)}
            label="Acidente Vascular Cerebral (AVC)"
            description="Protocolo para suspeita ou confirmação de AVC"
          />
          
          <MultiSelectButton
            checked={protocols.dorToracica}
            onChange={(checked) => onUpdateProtocols('dorToracica', checked)}
            label="Dor torácica"
            description="Protocolo para investigação de dor torácica"
          />
          
          <MultiSelectButton
            checked={protocols.naoSeAplica}
            onChange={(checked) => onUpdateProtocols('naoSeAplica', checked)}
            label="Não se aplica"
            description="Nenhum protocolo específico se aplica ao caso"
          />
        </div>
      </div>
    </div>
  );
};
