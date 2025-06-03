-- Verificar se RLS está ativo na tabela ai_analysis
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'ai_analysis';

-- Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'ai_analysis';

-- Tentar fazer uma query direta (execute como authenticated)
SELECT * FROM public.ai_analysis LIMIT 5;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total FROM public.ai_analysis;

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ai_analysis'
ORDER BY ordinal_position;

-- Teste com ID específico (substitua pelo ID que está tentando buscar)
SELECT * FROM public.ai_analysis 
WHERE id = '5f8a3a65-89ee-4c21-99d0-44d1c0c65bc5';

-- Desabilitar RLS temporariamente para teste (CUIDADO - apenas para debug)
-- ALTER TABLE public.ai_analysis DISABLE ROW LEVEL SECURITY;

-- Reabilitar RLS após teste
-- ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY; 