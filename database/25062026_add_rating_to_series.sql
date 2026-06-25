-- Adiciona a coluna de nota (rating) na tabela series
ALTER TABLE public.series 
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 10);

-- Comentário para documentação do banco
COMMENT ON COLUMN public.series.rating IS 'Nota de 1 a 10 atribuída pelo usuário';