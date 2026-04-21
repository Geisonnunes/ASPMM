import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Intercepta qualquer navegação quando mustChangePassword === true.
 * Aguarda o loading do AuthProvider antes de decidir o redirecionamento.
 */
const MustChangePasswordGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, mustChangePassword, loading } = useAuth();
  const location = useLocation();

  // Aguarda o profile ser carregado completamente antes de qualquer decisão
  if (loading) return null;

  const rotasLivres = ["/trocar-senha", "/login"];

  if (user && mustChangePassword && !rotasLivres.includes(location.pathname)) {
    return <Navigate to="/trocar-senha" replace />;
  }

  return <>{children}</>;
};

export default MustChangePasswordGuard;
