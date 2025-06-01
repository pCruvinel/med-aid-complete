
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExameFisico } from "./types";

interface ExameFisicoStepProps {
  exameFisico: ExameFisico;
  onUpdate: (field: keyof ExameFisico, value: string) => void;
}

export const ExameFisicoStep = ({ exameFisico, onUpdate }: ExameFisicoStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Exame Físico</h3>
      <p className="text-sm text-gray-600">Todos os campos são opcionais e possuem valores padrão que podem ser editados conforme necessário.</p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="estadoGeral">Estado Geral</Label>
          <Textarea
            id="estadoGeral"
            placeholder="Descrição do estado geral do paciente..."
            value={exameFisico.estadoGeral}
            onChange={(e) => onUpdate('estadoGeral', e.target.value)}
            className="mt-2 min-h-20"
          />
        </div>

        <div>
          <Label htmlFor="respiratorio">Sistema Respiratório</Label>
          <Textarea
            id="respiratorio"
            placeholder="Exame do sistema respiratório..."
            value={exameFisico.respiratorio}
            onChange={(e) => onUpdate('respiratorio', e.target.value)}
            className="mt-2 min-h-20"
          />
        </div>

        <div>
          <Label htmlFor="cardiovascular">Sistema Cardiovascular</Label>
          <Textarea
            id="cardiovascular"
            placeholder="Exame do sistema cardiovascular..."
            value={exameFisico.cardiovascular}
            onChange={(e) => onUpdate('cardiovascular', e.target.value)}
            className="mt-2 min-h-20"
          />
        </div>

        <div>
          <Label htmlFor="abdome">Abdome</Label>
          <Textarea
            id="abdome"
            placeholder="Exame do abdome..."
            value={exameFisico.abdome}
            onChange={(e) => onUpdate('abdome', e.target.value)}
            className="mt-2 min-h-20"
          />
        </div>

        <div>
          <Label htmlFor="extremidades">Extremidades</Label>
          <Textarea
            id="extremidades"
            placeholder="Exame das extremidades..."
            value={exameFisico.extremidades}
            onChange={(e) => onUpdate('extremidades', e.target.value)}
            className="mt-2 min-h-20"
          />
        </div>

        <div>
          <Label htmlFor="nervoso">Sistema Nervoso</Label>
          <Textarea
            id="nervoso"
            placeholder="Exame neurológico..."
            value={exameFisico.nervoso}
            onChange={(e) => onUpdate('nervoso', e.target.value)}
            className="mt-2 min-h-20"
          />
        </div>

        <div>
          <Label htmlFor="orofaringe">Orofaringe</Label>
          <Textarea
            id="orofaringe"
            placeholder="Exame da orofaringe..."
            value={exameFisico.orofaringe}
            onChange={(e) => onUpdate('orofaringe', e.target.value)}
            className="mt-2 min-h-20"
          />
        </div>

        <div>
          <Label htmlFor="otoscopia">Otoscopia</Label>
          <Textarea
            id="otoscopia"
            placeholder="Exame otoscópico..."
            value={exameFisico.otoscopia}
            onChange={(e) => onUpdate('otoscopia', e.target.value)}
            className="mt-2 min-h-20"
          />
        </div>
      </div>
    </div>
  );
};
