-- Faxina de Arquitetura: Remove as colunas redundantes de IDs de celebridades
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS favorite_actors_ids,
DROP COLUMN IF EXISTS favorite_directors_ids; -- Removemos também a de diretores por precaução se existir