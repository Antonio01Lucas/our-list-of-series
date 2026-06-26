-- database/26062026_add_onboarding_flag.sql
-- Migração: Adiciona flag para controle de fluxo do onboarding condicional

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;