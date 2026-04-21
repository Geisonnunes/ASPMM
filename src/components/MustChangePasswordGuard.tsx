import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Intercepta qualquer navegação quando mustChangePassword === true.
 * Redireciona para /trocar-senha, exceto quando já estiver lá.
 */
const MustChangePasswordGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, mustChangePassword, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (user && mustChangePassword && location.pathname !== "/trocar-senha") {
    return <Navigate to="/trocar-senha" replace />;
  }

  return <>{children}</>;
};

export default MustChangePasswordGuard;
