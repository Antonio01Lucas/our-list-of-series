-- 1. Criar ou atualizar a função que vai gerar o perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, favorite_actors, favorite_actresses, favorite_directors)
  values (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1), -- Pega a primeira parte do e-mail (antes do @) como username padrão
    NULL,
    '{}'::text[],                  -- Inicializa como um array de texto vazio
    '{}'::text[],                  -- Inicializa como um array de texto vazio
    '{}'::text[]                   -- Inicializa como um array de texto vazio
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar o gatilho (Trigger) que dispara a função ACIMA imediatamente após um INSERT em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();