-- Script para corrigir políticas RLS da tabela ai_analysis
-- Execute este script no Supabase SQL Editor

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view ai_analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "System can insert ai_analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "System can update ai_analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ai_analysis;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.ai_analysis;
DROP POLICY IF EXISTS "Enable update for all users" ON public.ai_analysis;

-- 2. Criar novas políticas que permitem acesso adequado
-- Permite leitura para todos (anônimo e autenticado)
CREATE POLICY "Enable read access for all users" 
ON public.ai_analysis FOR SELECT 
USING (true);

-- Permite inserção para todos
CREATE POLICY "Enable insert for all users" 
ON public.ai_analysis FOR INSERT 
WITH CHECK (true);

-- Permite atualização para todos
CREATE POLICY "Enable update for all users" 
ON public.ai_analysis FOR UPDATE 
USING (true);

-- 3. Garantir que RLS está habilitado
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- 4. Verificar se as políticas foram criadas corretamente
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'ai_analysis';

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Políticas RLS corrigidas com sucesso!';
    RAISE NOTICE 'A tabela ai_analysis agora permite acesso de leitura, inserção e atualização.';
END $$; 