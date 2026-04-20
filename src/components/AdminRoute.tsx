import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protege rotas que só o admin pode acessar.
 * - Enquanto carrega a sessão: mostra tela de carregamento.
 * - Usuário não logado: redireciona para /login.
 * - Logado mas não admin: redireciona para /.
 * - Admin: renderiza normalmente.
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
