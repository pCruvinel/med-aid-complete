# Fluxo de Impressão de Documentos

## Visão Geral
O sistema agora abre automaticamente os documentos PDF para impressão após a geração e permite visualizar documentos de consultas finalizadas.

## Funcionalidades Implementadas

### 1. Impressão Automática Após Geração
Quando o médico clica em "Gerar Documento" na interface de revisão:
1. O sistema envia os dados selecionados para o webhook `/doc`
2. Recebe o PDF binário do webhook
3. Salva o PDF no Supabase Storage
4. **Abre o PDF em uma nova janela/aba**
5. **Tenta iniciar automaticamente o diálogo de impressão**
6. Exibe uma notificação informando que o documento foi aberto para impressão

### 2. Botão "Ver Documento"
Para consultas já finalizadas:
- O botão "Ver Documento" aparece ao lado de consultas com status "Finalizada"
- Ao clicar, o sistema:
  1. Busca o documento mais recente da consulta
  2. Abre o PDF em uma nova aba
  3. Se não encontrar, exibe mensagem de erro

## Configuração do Storage

### Bucket Público
O bucket `consultation-documents` está configurado como público para permitir:
- Visualização direta dos PDFs sem autenticação
- Abertura em nova aba do navegador
- Impressão direta do navegador

### Script SQL de Configuração
Execute o arquivo `CONFIGURACAO_BUCKET_PUBLICO.sql` no Supabase para garantir as permissões corretas.

## Fluxo Técnico

### generateAndSaveDocument()
```typescript
// Após salvar o documento...
const { data: { publicUrl } } = supabase.storage
  .from('consultation-documents')
  .getPublicUrl(uploadData.path);

if (publicUrl) {
  const printWindow = window.open(publicUrl, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
}
```

### getDocumentPublicUrl()
```typescript
// Busca o documento mais recente
const { data } = await supabase
  .from('consultation_documents')
  .select('file_path')
  .eq('consultation_id', consultationId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

// Retorna URL pública
const { data: { publicUrl } } = supabase.storage
  .from('consultation-documents')
  .getPublicUrl(data.file_path);
```

## Considerações

### Bloqueio de Pop-ups
- Alguns navegadores podem bloquear a abertura automática de novas janelas
- O usuário deve permitir pop-ups para o domínio do sistema
- Se bloqueado, o documento ainda será salvo e pode ser acessado pelo botão "Ver Documento"

### Impressão Automática
- A função `window.print()` tenta abrir o diálogo de impressão
- Funciona melhor em Chrome, Firefox e Edge modernos
- Safari pode requerer interação adicional do usuário

### Fallback
Se a impressão automática não funcionar:
1. O documento ainda estará aberto na nova aba
2. O usuário pode usar Ctrl+P (ou Cmd+P no Mac) para imprimir
3. O documento fica salvo e acessível pelo botão "Ver Documento" 