-- database/26062026_update_series_schema.sql
-- Migração: Enriquecimento da tabela 'series' com metadados do TMDB para suporte a Filmes e motor de IA

ALTER TABLE series 
ADD COLUMN IF NOT EXISTS poster_path TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'tv',
ADD COLUMN IF NOT EXISTS genres TEXT[],
ADD COLUMN IF NOT EXISTS is_in_production BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS total_seasons INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_episodes INT DEFAULT 1;