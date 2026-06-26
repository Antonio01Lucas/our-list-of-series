-- database/26062026_profiles_trigger_and_rls.sql
-- Migração: Gatilho automático de segurança e políticas completas de RLS para a tabela profiles

-- =========================================================================
-- PARTE 1: GATILHO AUTOMÁTICO (TRIGGER)
-- =========================================================================

-- 1. Remove estruturas antigas conflitantes do gatilho
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Cria a função com tratamento de erro e inserção minimalista de segurança
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1) -- Define o início do e-mail como username padrão
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Captura qualquer exceção estrutural sem bloquear o fluxo de autenticação
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Associa o gatilho para disparar imediatamente após um novo registo
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =========================================================================
-- PARTE 2: POLÍTICAS DE SEGURANÇA DE CAMADA (RLS)
-- =========================================================================

-- Ativa o Row Level Security na tabela de perfis (caso não esteja ativo)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Limpa políticas antigas para evitar duplicidade ou conflitos
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view any profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile." ON public.profiles;

-- 1. POLÍTICA DE INSERÇÃO: Permite que o Trigger (ou o utilizador autenticado) crie o próprio perfil
CREATE POLICY "Users can insert their own profile." 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 2. POLÍTICA DE LEITURA (SELECT): Permite que qualquer utilizador logado veja perfis (essencial para buscar amigos)
CREATE POLICY "Users can view any profile."
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 3. POLÍTICA DE EDIÇÃO (UPDATE): Garante que APENAS o próprio dono consiga alterar os seus dados de perfil
CREATE POLICY "Users can update their own profile."
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. POLÍTICA DE EXCLUSÃO (DELETE): Garante que APENAS o próprio dono consiga apagar o seu registo
CREATE POLICY "Users can delete their own profile."
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);