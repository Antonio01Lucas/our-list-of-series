-- database/26062026_fix_rls_policies.sql
-- Migração: Correção da trava de segurança do RLS para permitir a exclusão física de registros (count > 0)

DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias séries" ON series;

CREATE POLICY "Usuários podem gerenciar suas próprias séries" 
ON series 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);