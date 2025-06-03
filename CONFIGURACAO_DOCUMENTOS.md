# Configuração do Sistema de Documentos - A3 Medical Assistant

## Visão Geral

O sistema agora recebe arquivos binários (PDF) do webhook e os armazena no Supabase Storage.

## 1. Execute a Migration SQL

Execute o arquivo `supabase/migrations/20240102_consultation_documents.sql` no Supabase SQL Editor para:

- ✅ Criar tabela `consultation_documents` para metadados
- ✅ Criar bucket `consultation-documents` no Storage
- ✅ Configurar políticas RLS e Storage

## 2. Fluxo de Documentos

### Envio de Dados
```json
{
  "id_consulta": "uuid-da-consulta",
  "id_analysis": "uuid-da-analise",
  "dados_selecionados": {
    "hda": "texto selecionado",
    "comorbidades": "texto selecionado",
    "medicacoes": "texto selecionado",
    "alergias": "texto selecionado",
    "hipotese_diagnostica": "texto selecionado",
    "conduta": "texto selecionado"
  }
}
```

### Resposta do Webhook
- **Tipo**: Binary (application/pdf)
- **Conteúdo**: Arquivo PDF do documento

### Armazenamento
1. Arquivo salvo em: `consultation-documents/documents/documento_{id_consulta}_{timestamp}.pdf`
2. Metadados salvos na tabela `consultation_documents`

## 3. Configuração do n8n

O webhook `/doc` deve:
1. Receber os dados JSON
2. Gerar o documento PDF
3. Retornar o arquivo binário com `Content-Type: application/pdf`

## 4. Acesso aos Documentos

Para baixar um documento salvo:

```javascript
// Buscar metadados
const { data: doc } = await supabase
  .from('consultation_documents')
  .select('*')
  .eq('consultation_id', consultationId)
  .single();

// Baixar arquivo
const { data: file } = await supabase.storage
  .from('consultation-documents')
  .download(doc.file_path);
```

## 5. Verificação

Execute no Supabase SQL Editor:

```sql
-- Verificar se a tabela foi criada
SELECT * FROM consultation_documents LIMIT 1;

-- Verificar bucket de storage
SELECT * FROM storage.buckets WHERE id = 'consultation-documents';
```

## Troubleshooting

### Erro: "Failed to fetch"
- Verifique CORS no webhook
- Confirme que o webhook retorna binary, não JSON

### Erro: "consultation_documents does not exist"
- Execute a migration SQL

### Erro de Upload
- Verifique políticas de storage
- Confirme que o bucket existe 