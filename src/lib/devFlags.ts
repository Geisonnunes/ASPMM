/**
 * Desenvolvimento: em `.env` ou `.env.local` define
 * `VITE_SKIP_ADMIN_GUARD=true` para aceder a /admin e /admin/conteudo
 * sem papel `admin` no Supabase.
 *
 * Nunca ativar em build/deploy público.
 */
export const skipAdminGuard =
  import.meta.env.VITE_SKIP_ADMIN_GUARD === "true";
