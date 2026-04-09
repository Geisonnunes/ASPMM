import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, CalendarDays, Image, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Início", path: "/" },
  { label: "Estrutura", path: "/estrutura" },
  { label: "Eventos", path: "/eventos" },
  { label: "Galeria", path: "/galeria" },
  { label: "Regulamento", path: "/regulamento" },
  { label: "Contato", path: "/contato" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut, profile } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero">
            <span className="text-lg font-bold text-primary-foreground font-heading">A</span>
          </div>
          <span className="text-xl font-bold text-foreground font-heading hidden sm:block">ASPMM</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors font-body ${
                location.pathname === link.path
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
                location.pathname === "/reservas"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Reservas
            </Link>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin"><Shield className="mr-1 h-4 w-4" />Admin</Link>
                </Button>
              )}
              <span className="text-sm text-muted-foreground">{profile?.full_name || "Associado"}</span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to="/login"><User className="mr-1 h-4 w-4" />Entrar</Link>
              </Button>
              <Button asChild size="sm" className="gradient-hero text-primary-foreground border-0">
                <Link to="/cadastro">Cadastrar</Link>
              </Button>
            </>
          )}
        </div>

        <button className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-card animate-fade-in">
          <div className="container py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link to="/reservas" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted">Reservas</Link>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted">Admin</Link>}
              </>
            )}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { signOut(); setOpen(false); }}>Sair</Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/login" onClick={() => setOpen(false)}>Entrar</Link></Button>
                  <Button asChild size="sm" className="flex-1 gradient-hero text-primary-foreground border-0"><Link to="/cadastro" onClick={() => setOpen(false)}>Cadastrar</Link></Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
