-- database/26062026_add_runtime_column.sql
-- Migração: Adição da coluna de duração para refinar métricas de consumo e filtros da IA

ALTER TABLE series 
ADD COLUMN IF NOT EXISTS runtime INT DEFAULT 0;