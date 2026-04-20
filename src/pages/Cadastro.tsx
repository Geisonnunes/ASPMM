import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logo from "@/assets/logo.png";

/**
 * Página /cadastro — acessível apenas por admins (protegida pelo AdminRoute no App.tsx).
 * O cadastro de novos associados é feito diretamente pelo Painel Administrativo.
 * Esta página serve como ponto de entrada direto para essa funcionalidade.
 */
const Cadastro = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-elevated text-center">
          <CardHeader className="items-center gap-2">
            <Link to="/">
              <img src={logo} alt="Logo" style={{ height: "40px" }} />
            </Link>
            <div className="flex items-center gap-2 justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-heading">
                Cadastro de Associado
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              O cadastro de novos associados é realizado pelo administrador.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground">
              Para cadastrar um novo associado, acesse o{" "}
              <strong>Painel Administrativo</strong> e utilize a aba{" "}
              <strong>Usuários → Novo Associado</strong>.
            </p>
            <Button
              asChild
              className="w-full gradient-hero text-primary-foreground border-0"
            >
              <Link to="/admin">Ir para o Painel Administrativo</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Voltar para o início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Cadastro;
