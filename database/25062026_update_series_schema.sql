-- database/25062026_update_series_schema.sql

-- Adicionando colunas de controle para a Fase 2 (Core Engine)
ALTER TABLE series
ADD COLUMN IF NOT EXISTS tmdb_id INT8,
ADD COLUMN IF NOT EXISTS current_season INT4 DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_episode INT4 DEFAULT 1;

-- Comentários para facilitar a manutenção futura
COMMENT ON COLUMN series.tmdb_id IS 'ID oficial da API do TMDB para cruzamento de dados';
COMMENT ON COLUMN series.current_season IS 'Temporada atual do usuário';
COMMENT ON COLUMN series.current_episode IS 'Episódio atual do usuário';