# Como Criar o Bucket no Supabase Storage

## Erro: "Bucket not found"
Este erro ocorre porque o bucket `consultation-documents` ainda não foi criado no Supabase Storage.

## Passo a Passo para Criar o Bucket

### 1. Acesse o Supabase Dashboard
1. Entre em https://app.supabase.com
2. Selecione seu projeto

### 2. Navegue até Storage
1. No menu lateral, clique em **Storage**
2. Você verá a lista de buckets existentes

### 3. Crie o Novo Bucket
1. Clique no botão **"New bucket"** ou **"Create bucket"**
2. Configure o bucket com os seguintes parâmetros:
   - **Nome do bucket**: `consultation-documents`
   - **Public bucket**: ✅ Marque esta opção (IMPORTANTE!)
   - **File size limit**: 10MB (ou 10485760 bytes)
   - **Allowed MIME types**: `application/pdf`

### 4. Confirme a Criação
1. Clique em **"Create bucket"**
2. O bucket deve aparecer na lista

### 5. Execute o Script SQL
Após criar o bucket, execute o script `CONFIGURACAO_BUCKET_PUBLICO.sql` no SQL Editor do Supabase para configurar as políticas de acesso.

## Verificação
Para verificar se o bucket foi criado corretamente:
1. Vá em Storage no dashboard
2. O bucket `consultation-documents` deve estar listado
3. Deve ter um ícone de "globo" indicando que é público

## Alternativa via SQL (Avançado)
Se preferir criar via SQL, use este comando no SQL Editor:

```sql
-- Criar bucket via SQL (requer extensão storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'consultation-documents',
  'consultation-documents',
  true,
  10485760,
  ARRAY['application/pdf']::text[]
);
```

## Troubleshooting
Se ainda receber erro após criar o bucket:
1. Verifique se o nome está exatamente como `consultation-documents` (com hífen)
2. Certifique-se que o bucket está marcado como público
3. Aguarde alguns segundos para a propagação das mudanças
4. Tente fazer logout e login novamente na aplicação 