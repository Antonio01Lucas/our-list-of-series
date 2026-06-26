-- Migração incremental: Adiciona os campos de preferências do Onboarding
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS favorite_actors TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS favorite_directors TEXT[] DEFAULT '{}';