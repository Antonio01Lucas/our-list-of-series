-- Habilita a operação de DELETE na tabela "series"
-- Permite que usuários autenticados apaguem apenas os registros onde o user_id corresponde ao seu próprio ID de autenticação.

CREATE POLICY "Permitir que utilizadores apaguem os seus próprios registos"
ON "public"."series"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);