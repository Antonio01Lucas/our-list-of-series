-- database/schema.sql
-- Fotografia completa e atualizada da arquitetura do banco SyncWatch

CREATE TABLE IF NOT EXISTS series (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL,                              -- 'assistir', 'assistindo', 'finalizado'
    tmdb_id INT,                                       -- ID oficial da API do TMDB
    media_type TEXT DEFAULT 'tv',                      -- 'tv' ou 'movie'
    poster_path TEXT,                                  -- Cache da URL da imagem da capa
    genres TEXT[],                                     -- Array de gêneros para o motor de IA
    is_in_production BOOLEAN DEFAULT true,              -- Se a obra ainda está lançando episódios
    current_season INT DEFAULT 1,                      -- Temporada atual do usuário
    current_episode INT DEFAULT 1,                     -- Episódio atual do usuário
    total_seasons INT DEFAULT 1,                       -- Total de temporadas existentes
    total_episodes INT DEFAULT 1,                      -- Total de episódios existentes
    rating INT CHECK (rating >= 1 AND rating <= 10),     -- Sistema de Notas (1 a 10)
    runtime INT DEFAULT 0,                             -- Duração em minutos (filme ou episódio)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para proteção de dados
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas antigas redundantes
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias séries" ON series;

-- Nova política unificada e blindada para todas as operações (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Usuários podem gerenciar suas próprias séries" 
ON series 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);