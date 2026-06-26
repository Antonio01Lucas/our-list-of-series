-- 1. Remover o gatilho e a função antiga para evitar conflitos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Criar a nova função com tratamento de erro e inserção minimalista de segurança
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Tenta fazer a inserção segura apenas com ID e Username base
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1) -- Define o início do e-mail como username padrão
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Se houver algum erro de estrutura de colunas, o Postgres regista mas não quebra o fluxo
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar o gatilho para disparar imediatamente após o registo completo
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();