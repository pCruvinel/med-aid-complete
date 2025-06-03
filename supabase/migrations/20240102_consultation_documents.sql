-- Criar tabela para armazenar metadados dos documentos
CREATE TABLE IF NOT EXISTS public.consultation_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT DEFAULT 'application/pdf',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_consultation_documents_consultation_id 
ON public.consultation_documents(consultation_id);

-- Configurar RLS
ALTER TABLE public.consultation_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Enable read access for all users" ON public.consultation_documents;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.consultation_documents;
DROP POLICY IF EXISTS "Enable update for all users" ON public.consultation_documents;

CREATE POLICY "Enable read access for all users" 
ON public.consultation_documents FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON public.consultation_documents FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON public.consultation_documents FOR UPDATE 
USING (true);

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_consultation_documents_updated_at ON public.consultation_documents;
CREATE TRIGGER update_consultation_documents_updated_at
    BEFORE UPDATE ON public.consultation_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar bucket de storage para documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('consultation-documents', 'consultation-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Configurar políticas de storage
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete documents" ON storage.objects;

-- Política para upload
CREATE POLICY "Users can upload documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'consultation-documents' 
        AND auth.role() IN ('authenticated', 'anon')
    );

-- Política para visualizar
CREATE POLICY "Users can view documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'consultation-documents' 
        AND auth.role() IN ('authenticated', 'anon')
    );

-- Política para deletar (apenas autenticados)
CREATE POLICY "Users can delete documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'consultation-documents' 
        AND auth.role() = 'authenticated'
    );

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Tabela consultation_documents criada com sucesso!';
    RAISE NOTICE 'Bucket consultation-documents configurado!';
    RAISE NOTICE 'Políticas RLS e Storage configuradas!';
END $$; 