# Fluxo de Loading do Sistema

## Visão Geral
O sistema possui dois momentos principais de loading com experiências visuais customizadas:

### 1. ProcessingLoader - Processamento da Consulta (30 segundos)
**Quando aparece**: Após finalizar o formulário de consulta
**Duração aproximada**: 30 segundos
**Localização**: Tela cheia

#### Etapas do ProcessingLoader:
1. **Enviando dados** (3s) - Upload das informações
2. **Transcrevendo áudio** (8s) - Conversão de voz para texto
3. **Analisando com IA** (7s) - Processamento inteligente
4. **Gerando sugestões** (6s) - Criação de recomendações baseadas em áudio e texto
5. **Organizando dados** (4s) - Estruturação para revisão
6. **Finalizando** (2s) - Preparação da interface

#### Características visuais:
- Ícone central animado que muda conforme o progresso
- Barra de progresso com porcentagem
- Indicadores de etapas com animações
- Padrões de fundo animados
- Cores em gradiente azul/verde

### 2. DocumentGeneratingLoader - Geração do Documento (12 segundos)
**Quando aparece**: Ao clicar em "Gerar Documento" na tela de revisão
**Duração aproximada**: 12 segundos
**Localização**: Modal sobreposto

#### Etapas do DocumentGeneratingLoader:
1. **Enviando dados selecionados** (2s) - Preparação das informações finais
2. **Formatando documento** (3s) - Aplicação de padrões médicos
3. **Gerando PDF** (3s) - Criação do arquivo
4. **Validando conteúdo** (2s) - Verificação de completude
5. **Preparando impressão** (2s) - Otimização para visualização

#### Características visuais:
- Modal compacto com backdrop escuro
- Ícone animado menor
- Barra de progresso mais fina
- Indicadores de progresso em pontos
- Cores em gradiente verde/esmeralda

## Implementação Técnica

### ProcessingLoader
```typescript
// Em Index.tsx
if (activeView === 'processing') {
  return <ProcessingLoader patientName={processingPatientName} />;
}
```

### DocumentGeneratingLoader
```typescript
// Em ReviewInterface.tsx
{generatingDocument && (
  <DocumentGeneratingLoader patientName={consultation.patient_name} />
)}
```

## Estados de Loading

### Estados do sistema:
1. **dashboard** - Tela inicial
2. **consultation** - Formulário de consulta
3. **processing** - ProcessingLoader (30s)
4. **review** - Interface de revisão
5. **generating** - DocumentGeneratingLoader (12s) - sobreposto à revisão

### Transições:
- `consultation` → `processing` → `review`
- `review` → `generating` (modal) → `dashboard`

## Experiência do Usuário

### Durante o processamento (30s):
- Usuário vê progresso detalhado da análise
- Mensagens informativas sobre cada etapa
- Animações suaves mantêm engajamento
- Nome do paciente sempre visível

### Durante geração do documento (12s):
- Modal permite ver a tela de revisão ao fundo
- Progresso rápido e focado
- Mensagem clara sobre abertura automática para impressão
- Design compacto não obstrui totalmente a visão

## Tratamento de Erros

### ProcessingLoader:
- Em caso de erro, retorna ao dashboard
- Toast com mensagem específica do erro
- Mantém dados do formulário para retry

### DocumentGeneratingLoader:
- Em caso de erro, fecha o modal
- Toast com mensagem de erro
- Permite tentar novamente sem perder seleções

## Customização

### Ajustar tempos:
Modificar array `steps` em cada componente:
```typescript
const steps = [
  { duration: 3000 }, // millisegundos
  // ...
];
```

### Adicionar/remover etapas:
Adicionar objetos ao array `steps` com:
- `icon`: Ícone do Lucide
- `message`: Mensagem principal
- `subMessage`: Mensagem secundária
- `duration`: Duração em ms 