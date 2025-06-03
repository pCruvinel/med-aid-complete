-- Script completo para configurar o Storage do Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar a extensão de storage (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar o bucket para documentos de consulta
-- NOTA: Este comando pode falhar se você não tiver as permissões necessárias
-- Nesse caso, crie o bucket manualmente pelo Dashboard conforme instruções em CRIAR_BUCKET_STORAGE.md
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'consultation-documents',
    'consultation-documents',
    true, -- bucket público para permitir visualização direta
    10485760, -- 10MB limite
    ARRAY['application/pdf']::text[]
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf']::text[];
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Não foi possível criar o bucket via SQL. Por favor, crie manualmente no Dashboard.';
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar bucket: %. Por favor, crie manualmente no Dashboard.', SQLERRM;
END $$;

-- 3. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura pública de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de documentos" ON storage.objects;

-- 4. Criar políticas de acesso para o bucket
-- Política para permitir leitura pública (qualquer pessoa pode visualizar os PDFs)
CREATE POLICY "Permitir leitura pública de documentos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'consultation-documents');

-- Política para permitir upload (sistema pode fazer upload sem autenticação)
CREATE POLICY "Permitir upload de documentos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'consultation-documents');

-- Política para permitir atualização
CREATE POLICY "Permitir atualização de documentos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'consultation-documents');

-- Política para permitir exclusão
CREATE POLICY "Permitir exclusão de documentos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'consultation-documents');

-- 5. Verificar se o bucket foi criado
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'consultation-documents';

-- Se a query acima não retornar resultados, o bucket precisa ser criado manualmente no Dashboard 