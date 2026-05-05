import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MustChangePasswordGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, mustChangePassword, loading, isSigningOut } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Se não está logado e está na /trocar-senha, redireciona para home
  if (!user && location.pathname === "/trocar-senha") {
    return <Navigate to="/" replace />;
  }

  if (isSigningOut) return <>{children}</>;

  const rotasLivres = ["/trocar-senha", "/login"];

  if (user && mustChangePassword && !rotasLivres.includes(location.pathname)) {
    return <Navigate to="/trocar-senha" replace />;
  }

  return <>{children}</>;
};

export default MustChangePasswordGuard;
