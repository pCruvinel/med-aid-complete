-- Configurar o bucket consultation-documents para permitir acesso público de leitura

-- Criar o bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'consultation-documents',
  'consultation-documents',
  true, -- bucket público
  10485760, -- 10MB limite
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de documentos" ON storage.objects
FOR SELECT USING (bucket_id = 'consultation-documents');

-- Política para permitir upload autenticado ou anônimo (para o sistema)
CREATE POLICY "Permitir upload de documentos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'consultation-documents');

-- Política para permitir atualização
CREATE POLICY "Permitir atualização de documentos" ON storage.objects
FOR UPDATE USING (bucket_id = 'consultation-documents');

-- Política para permitir exclusão
CREATE POLICY "Permitir exclusão de documentos" ON storage.objects
FOR DELETE USING (bucket_id = 'consultation-documents'); 