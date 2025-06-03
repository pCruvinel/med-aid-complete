# Mudanças no Fluxo do Webhook - A3 Medical Assistant

## Resumo das Alterações

O fluxo foi alterado para aguardar a resposta do webhook antes de prosseguir para a revisão, garantindo que os dados da análise da IA estejam disponíveis.

## Novo Fluxo Implementado

### 1. Envio do Webhook
- **Trigger**: Finalização da consulta médica (botão "Finalizar Consulta")
- **Ação**: Sistema envia todos os dados coletados + áudio em Base64 para o webhook
- **Status**: Consulta criada com status `generating-analysis`

### 2. Aguardo da Resposta
- **Formato Esperado da Resposta**:
```json
{
  "id": "57ccd43d-248e-465b-8bb3-01876a95da05",
  "consultation_id": "8dced62a-45c0-45b2-b89e-fd3562d749c9"
}
```
- **Validação**: Sistema valida se a resposta contém os campos obrigatórios
- **Timeout**: 30 segundos com até 3 tentativas

### 3. Busca dos Dados da Análise
- **Query Executada**:
```sql
SELECT 
  id,
  consultation_id,
  hda_ai,
  comorbidades_ai,
  medicacoes_ai,
  alergias_ai,
  hipotese_diagnostica_ai,
  conduta_ai,
  analysis_timestamp,
  processing_status
FROM ai_analysis 
WHERE id = {webhook_response.id}
```
- **Polling**: Sistema tenta buscar os dados até 10 vezes com intervalo de 2 segundos
- **Condição de Sucesso**: `processing_status = 'completed'`

### 4. Atualização do Status
- **Ação**: Após dados disponíveis, atualiza status da consulta para `pending-review`
- **Interface**: Usuário é redirecionado para o dashboard com mensagem de sucesso

## Alterações no Código

### 1. `webhookService.ts`
- **sendToWebhook**: Agora aguarda resposta síncrona do webhook
- **waitForAnalysisData**: Nova função que faz polling dos dados da análise
- **Validação**: Adicionada validação do payload de resposta

### 2. `consultationService.ts`
- **getAiAnalysisById**: Novo método para buscar análise por ID
- **validateWebhookPayload**: Novo método para validar resposta do webhook

### 3. `Index.tsx`
- **handleConsultationComplete**: Modificado para usar fluxo síncrono
- **Mensagens**: Atualizadas para refletir o processo de aguardo

## Benefícios

1. **Garantia de Dados**: Revisão só é permitida quando dados da IA estão disponíveis
2. **Feedback Imediato**: Usuário sabe se houve erro no processamento
3. **Fluxo Simplificado**: Sem necessidade de atualização manual ou refresh

## Tratamento de Erros

- **Timeout do Webhook**: Mensagem específica sobre conectividade
- **Análise Indisponível**: Mensagem informando para tentar novamente
- **Resposta Inválida**: Validação do formato da resposta

## Configuração do Webhook

O webhook deve retornar exatamente o formato especificado:
```json
{
  "id": "uuid-da-analise",
  "consultation_id": "uuid-da-consulta"
}
```

Onde:
- `id`: Identificador único da análise na tabela `ai_analysis`
- `consultation_id`: Identificador da consulta original 