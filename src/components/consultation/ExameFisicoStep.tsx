import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExameFisico } from "./types";
import { 
  Heart, 
  Activity, 
  Brain, 
  User, 
  Stethoscope,
  Eye,
  Ear,
  Wind
} from "lucide-react";

interface ExameFisicoStepProps {
  exameFisico: ExameFisico;
  onUpdate: (field: keyof ExameFisico, value: string) => void;
}

interface ExamField {
  key: keyof ExameFisico;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  normalTemplate: string;
  minHeight: string;
}

export const ExameFisicoStep = ({ exameFisico, onUpdate }: ExameFisicoStepProps) => {
  const examFields: ExamField[] = [
    {
      key: 'estadoGeral',
      label: 'Estado Geral',
      icon: <User className="w-5 h-5" />,
      placeholder: 'Descreva o estado geral do paciente.',
      normalTemplate: 'Paciente em bom estado geral, lúcido, orientado no tempo e no espaço, acianótico, anictérico e afebril. Pele e mucosas coradas e hidratadas.',
      minHeight: 'min-h-24'
    },
    {
      key: 'respiratorio',
      label: 'Sistema Respiratório',
      icon: <Wind className="w-5 h-5" />,
      placeholder: 'Inspeção torácica, padrão respiratório, ausculta pulmonar..',
      normalTemplate: 'Tórax simétrico, sem deformidades. Expansibilidade pulmonar preservada. Ausculta: Murmúrio vesicular fisiológico presente bilateral, sem ruídos adventícios.',
      minHeight: 'min-h-20'
    },
    {
      key: 'cardiovascular',
      label: 'Sistema Cardiovascular',
      icon: <Heart className="w-5 h-5" />,
      placeholder: 'Ausculta cardíaca, ritmo, frequência...',
      normalTemplate: 'Ausculta: Ritmo cardíaco regular em dois tempos, sem sopros. Pulsos periféricos palpáveis e simétricos.',
      minHeight: 'min-h-20'
    },
    {
      key: 'abdome',
      label: 'Abdome',
      icon: <Activity className="w-5 h-5" />,
      placeholder: 'Inspeção, ausculta, percussão e palpação abdominal. Massas, dor, organomegalias...',
      normalTemplate: 'Abdome plano, ruídos hidroaéreos presentes, normotimpânico, indolor à palpação, sem massa ou visceromegalias.',
      minHeight: 'min-h-20'
    },
    {
      key: 'extremidades',
      label: 'Extremidades',
      icon: <Stethoscope className="w-5 h-5" />,
      placeholder: 'Membros superiores e inferiores, edemas, pulsos, perfusão, deformidades...',
      normalTemplate: 'Extremidades sem edemas, panturrilhas livres, TEC < 3s. Pulsos palpáveis e simétricos.',
      minHeight: 'min-h-20'
    },
    {
      key: 'nervoso',
      label: 'Sistema Nervoso',
      icon: <Brain className="w-5 h-5" />,
      placeholder: 'Avaliação neurológica: consciência, pupilas, força muscular, reflexos, sensibilidade...',
      normalTemplate: 'ECG 15, Pupilas isocóricas e fotorreativas. Força muscular preservada nos 4 membros. Reflexos presentes e simétricos.',
      minHeight: 'min-h-20'
    },
    {
      key: 'orofaringe',
      label: 'Orofaringe',
      icon: <Eye className="w-5 h-5" />,
      placeholder: 'Exame da cavidade oral, mucosas, amígdalas, faringe, dentição...',
      normalTemplate: 'Mucosa bucal úmida e corada, sem lesões. Amígdalas simétricas, sem hiperemia ou exsudato. Faringe clara.',
      minHeight: 'min-h-18'
    },
    {
      key: 'otoscopia',
      label: 'Otoscopia',
      icon: <Ear className="w-5 h-5" />,
      placeholder: 'Exame otoscópico bilateral: conduto auditivo, tímpano, secreções...',
      normalTemplate: 'Conduto auditivo externo livre. Tímpano íntegro, translúcido, com reflexo luminoso presente bilateralmente.',
      minHeight: 'min-h-18'
    }
  ];

  const insertNormalTemplate = (field: keyof ExameFisico, template: string) => {
    onUpdate(field, template);
  };

  const clearField = (field: keyof ExameFisico) => {
    onUpdate(field, '');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Exame Físico</h3>
        <p className="text-sm text-gray-600 mt-2">
          Todos os campos são opcionais. Use os botões de template para acelerar o preenchimento.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {examFields.map((field) => (
          <div key={field.key} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="text-blue-600">{field.icon}</div>
              <Label htmlFor={field.key} className="font-medium text-base">
                {field.label}
              </Label>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertNormalTemplate(field.key, field.normalTemplate)}
                  className="text-xs"
                >
                  Normal
                </Button>
                {exameFisico[field.key] && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => clearField(field.key)}
                    className="text-xs text-red-600"
                  >
                    Limpar
                  </Button>
                )}
              </div>
              
              <Textarea
                id={field.key}
                placeholder={field.placeholder}
                value={exameFisico[field.key]}
                onChange={(e) => onUpdate(field.key, e.target.value)}
                className={`${field.minHeight} resize-none`}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Dicas de Preenchimento:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use os botões "Normal" para inserir achados normais padrão</li>
          <li>• Focalize nas alterações patológicas encontradas</li>
          <li>• Campos vazios serão interpretados como "não examinado"</li>
        </ul>
      </div>
    </div>
  );
};
