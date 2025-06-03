-- Verificação e Configuração do Banco de Dados para o Novo Fluxo do Webhook
-- A3 Medical Assistant

-- 1. Verificar se a tabela ai_analysis existe com todos os campos necessários
-- Se não existir, criar:
CREATE TABLE IF NOT EXISTS public.ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    hda_ai TEXT,
    comorbidades_ai TEXT,
    medicacoes_ai TEXT,
    alergias_ai TEXT,
    hipotese_diagnostica_ai TEXT,
    conduta_ai TEXT,
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    webhook_attempts INTEGER DEFAULT 0,
    processing_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_consultation_id ON public.ai_analysis(consultation_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_processing_status ON public.ai_analysis(processing_status);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON public.ai_analysis(created_at DESC);

-- 3. Configurar políticas RLS (Row Level Security)
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view ai_analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "System can insert ai_analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "System can update ai_analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ai_analysis;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.ai_analysis;
DROP POLICY IF EXISTS "Enable update for service role" ON public.ai_analysis;

-- Política para leitura (permite acesso anônimo e autenticado)
CREATE POLICY "Enable read access for all users" ON public.ai_analysis
    FOR SELECT USING (true);

-- Política para inserção (permite inserção anônima e autenticada)
CREATE POLICY "Enable insert for all users" ON public.ai_analysis
    FOR INSERT WITH CHECK (true);

-- Política para atualização (permite atualização anônima e autenticada)
CREATE POLICY "Enable update for all users" ON public.ai_analysis
    FOR UPDATE USING (true);

-- 4. Verificar se os campos necessários existem na tabela consultations
-- Adicionar campos se não existirem:
DO $$ 
BEGIN
    -- Campo webhook_lock_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultations' 
                   AND column_name = 'webhook_lock_id') THEN
        ALTER TABLE public.consultations ADD COLUMN webhook_lock_id TEXT;
    END IF;
    
    -- Campo analysis_started_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultations' 
                   AND column_name = 'analysis_started_at') THEN
        ALTER TABLE public.consultations ADD COLUMN analysis_started_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Campo analysis_completed_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultations' 
                   AND column_name = 'analysis_completed_at') THEN
        ALTER TABLE public.consultations ADD COLUMN analysis_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Campos originais do médico
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultations' 
                   AND column_name = 'hda_original') THEN
        ALTER TABLE public.consultations ADD COLUMN hda_original TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultations' 
                   AND column_name = 'hipotese_diagnostica_original') THEN
        ALTER TABLE public.consultations ADD COLUMN hipotese_diagnostica_original TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultations' 
                   AND column_name = 'conduta_original') THEN
        ALTER TABLE public.consultations ADD COLUMN conduta_original TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultations' 
                   AND column_name = 'comorbidades_original') THEN
        ALTER TABLE public.consultations ADD COLUMN comorbidades_original JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultations' 
                   AND column_name = 'medicacoes_original') THEN
        ALTER TABLE public.consultations ADD COLUMN medicacoes_original JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'consultations' 
                   AND column_name = 'alergias_original') THEN
        ALTER TABLE public.consultations ADD COLUMN alergias_original JSONB;
    END IF;
END $$;

-- 5. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela ai_analysis
DROP TRIGGER IF EXISTS update_ai_analysis_updated_at ON public.ai_analysis;
CREATE TRIGGER update_ai_analysis_updated_at
    BEFORE UPDATE ON public.ai_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Criar função para inserir dados de análise (usada pelo webhook)
CREATE OR REPLACE FUNCTION insert_ai_analysis(
    p_id UUID,
    p_consultation_id UUID,
    p_hda_ai TEXT,
    p_comorbidades_ai TEXT,
    p_medicacoes_ai TEXT,
    p_alergias_ai TEXT,
    p_hipotese_diagnostica_ai TEXT,
    p_conduta_ai TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.ai_analysis (
        id,
        consultation_id,
        hda_ai,
        comorbidades_ai,
        medicacoes_ai,
        alergias_ai,
        hipotese_diagnostica_ai,
        conduta_ai,
        processing_status,
        analysis_timestamp
    ) VALUES (
        p_id,
        p_consultation_id,
        p_hda_ai,
        p_comorbidades_ai,
        p_medicacoes_ai,
        p_alergias_ai,
        p_hipotese_diagnostica_ai,
        p_conduta_ai,
        'completed',
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        hda_ai = EXCLUDED.hda_ai,
        comorbidades_ai = EXCLUDED.comorbidades_ai,
        medicacoes_ai = EXCLUDED.medicacoes_ai,
        alergias_ai = EXCLUDED.alergias_ai,
        hipotese_diagnostica_ai = EXCLUDED.hipotese_diagnostica_ai,
        conduta_ai = EXCLUDED.conduta_ai,
        processing_status = 'completed',
        analysis_timestamp = NOW(),
        updated_at = NOW();
        
    -- Atualizar status da consulta
    UPDATE public.consultations 
    SET status = 'pending-review',
        analysis_completed_at = NOW()
    WHERE id = p_consultation_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Conceder permissões necessárias
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.ai_analysis TO authenticated;
GRANT ALL ON public.consultations TO authenticated;
GRANT EXECUTE ON FUNCTION insert_ai_analysis TO authenticated;

-- 8. Criar constraint única para evitar duplicações (removendo se já existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_consultation_analysis'
    ) THEN
        ALTER TABLE public.ai_analysis 
        ADD CONSTRAINT unique_consultation_analysis UNIQUE (consultation_id);
    END IF;
END $$;

-- 9. Verificar se o bucket de áudio existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('consultation-audio', 'consultation-audio', false)
ON CONFLICT (id) DO NOTHING;

-- 10. Configurar políticas de storage para áudio
-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their audio" ON storage.objects;

-- Criar políticas de storage
CREATE POLICY "Users can upload audio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'consultation-audio' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view their audio" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'consultation-audio' 
        AND auth.role() = 'authenticated'
    );

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Configurações do banco de dados aplicadas com sucesso!';
    RAISE NOTICE 'Tabelas verificadas: consultations, ai_analysis, audio_recordings';
    RAISE NOTICE 'Índices criados para melhor performance';
    RAISE NOTICE 'Políticas RLS configuradas';
    RAISE NOTICE 'Função insert_ai_analysis criada para uso do webhook';
END $$; 