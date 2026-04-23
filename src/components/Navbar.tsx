import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { skipAdminGuard } from "@/lib/devFlags";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Início", path: "/" },
  { label: "Espaços", path: "/estrutura" },
  { label: "Eventos", path: "/eventos" },
  { label: "Galeria", path: "/galeria" },
  { label: "Regulamento", path: "/regulamento" },
  { label: "Contato", path: "/contato" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut, profile } = useAuth();
  const showAdminNav = isAdmin || skipAdminGuard;

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* LOGO */}
        <Link to="/">
          <img src={logo} alt="Logo" style={{ height: "40px" }} />
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors font-body ${
                isActive(link.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user && (
            <Link
              to="/reservas"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors font-body ${
                isActive("/reservas")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Reservas
            </Link>
          )}
        </nav>

        {/* AÇÕES DESKTOP */}
        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              {showAdminNav && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin">
                    <Shield className="mr-1 h-4 w-4" />
                    Painel Admin
                  </Link>
                </Button>
              )}

              <span className="text-sm text-muted-foreground">
                {profile?.full_name || "Associado"}
              </span>

              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {skipAdminGuard && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin">
                    <Shield className="mr-1 h-4 w-4" />
                    Painel Admin
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link to="/login">
                  <User className="mr-1 h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* BOTÃO MOBILE */}
        <button
          className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MENU MOBILE */}
      {open && (
        <div className="lg:hidden border-t border-border bg-card animate-fade-in relative z-50">
          <div className="container py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <Link
                to="/reservas"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Reservas
              </Link>
            )}

            {showAdminNav && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Painel Admin
              </Link>
            )}

            <div className="flex gap-2 pt-2">
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                >
                  Sair
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Entrar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
