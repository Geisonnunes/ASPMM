-- ============================================================
-- Migração: sistema de senha temporária + login por CPF
-- ============================================================

-- 1. Adiciona o campo must_change_password na tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

-- 2. Função segura para buscar o email de um usuário pelo CPF
--    Usada no frontend para converter CPF → email antes do signIn.
--    É SECURITY DEFINER para poder consultar profiles sem expor dados extras.
CREATE OR REPLACE FUNCTION public.get_email_by_cpf(p_cpf TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.email
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.cpf = p_cpf
  LIMIT 1;
$$;

-- Permite que qualquer usuário autenticado ou anônimo chame a função
-- (necessário para o fluxo de login por CPF antes de autenticar)
GRANT EXECUTE ON FUNCTION public.get_email_by_cpf(TEXT) TO anon, authenticated;