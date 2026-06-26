-- database/schema.sql
-- Arquitetura completa da tabela 'series' do SyncWatch atualizada

CREATE TABLE IF NOT EXISTS series (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL,                          -- 'assistir', 'assistindo', 'finalizado'
    tmdb_id INT,                                   -- ID oficial da API do TMDB
    media_type TEXT DEFAULT 'tv',                  -- 'tv' ou 'movie'
    poster_path TEXT,                              -- Cache da URL da imagem da capa
    genres TEXT[],                                 -- Array de gêneros para o cruzamento de dados da IA
    is_in_production BOOLEAN DEFAULT true,          -- Se a série ainda está lançando episódios
    current_season INT DEFAULT 1,                  -- Temporada atual do usuário
    current_episode INT DEFAULT 1,                 -- Episódio atual do usuário
    total_seasons INT DEFAULT 1,                   -- Total de temporadas existentes na obra
    total_episodes INT DEFAULT 1,                  -- Total de episódios existentes na obra
    rating INT CHECK (rating >= 1 AND rating <= 10), -- Sistema de Notas (1 a 10)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar o Row Level Security (RLS) para blindar o banco de dados
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

-- Política de Segurança: Garante que um usuário autenticado só possa ler/escrever seus próprios registros
CREATE POLICY "Usuários podem gerenciar suas próprias séries" 
ON series 
FOR ALL 
USING (auth.uid() = user_id);