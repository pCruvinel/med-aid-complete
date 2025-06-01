
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Protocols } from "./types";

interface ProtocolsStepProps {
  protocols: Protocols;
  onUpdateProtocols: (field: keyof Protocols, value: any) => void;
  onUpdateSepseAdulto: (field: keyof Protocols['sepseAdulto'], value: boolean) => void;
}

export const ProtocolsStep = ({ protocols, onUpdateProtocols, onUpdateSepseAdulto }: ProtocolsStepProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Protocolos Gerenciados</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Sepse adulto:</Label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sirs"
                checked={protocols.sepseAdulto.sirs}
                onCheckedChange={(checked) => onUpdateSepseAdulto('sirs', !!checked)}
              />
              <Label htmlFor="sirs">SIRS ≥ 2</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="disfuncao"
                checked={protocols.sepseAdulto.disfuncao}
                onCheckedChange={(checked) => onUpdateSepseAdulto('disfuncao', !!checked)}
              />
              <Label htmlFor="disfuncao">Pelo menos 1 disfunção orgânica</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="news"
                checked={protocols.sepseAdulto.news}
                onCheckedChange={(checked) => onUpdateSepseAdulto('news', !!checked)}
              />
              <Label htmlFor="news">Escore News ≥ 5</Label>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="sepse-pediatrica"
            checked={protocols.sepsePediatrica}
            onCheckedChange={(checked) => onUpdateProtocols('sepsePediatrica', !!checked)}
          />
          <Label htmlFor="sepse-pediatrica">Sepse pediátrica</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="avc"
            checked={protocols.avc}
            onCheckedChange={(checked) => onUpdateProtocols('avc', !!checked)}
          />
          <Label htmlFor="avc">Acidente Vascular Cerebral (AVC)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="dor-toracica"
            checked={protocols.dorToracica}
            onCheckedChange={(checked) => onUpdateProtocols('dorToracica', !!checked)}
          />
          <Label htmlFor="dor-toracica">Dor torácica</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="nao-se-aplica"
            checked={protocols.naoSeAplica}
            onCheckedChange={(checked) => onUpdateProtocols('naoSeAplica', !!checked)}
          />
          <Label htmlFor="nao-se-aplica">Não se aplica</Label>
        </div>
      </div>
    </div>
  );
};
