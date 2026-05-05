import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

/**
 * Exibida após o primeiro login quando must_change_password === true.
 * O associado DEVE definir uma nova senha antes de acessar qualquer outra página.
 */
const TrocarSenha = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrocar = async () => {
    if (novaSenha.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    // 1. Atualiza a senha no Supabase Auth
    const { error: authErr } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (authErr) {
      toast.error("Erro ao atualizar senha: " + authErr.message);
      setLoading(false);
      return;
    }

    // 2. Marca must_change_password = false no profile
    if (user) {
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ must_change_password: false } as any)
        .eq("id", user.id);

      if (profileErr) {
        console.error(
          "[TrocarSenha] Erro ao atualizar profile:",
          profileErr.message,
        );
      }
    }

    toast.success("Senha definida com sucesso! Bem-vindo à ASPMM.");
    setLoading(false);

    // 3. Redireciona para o início
    window.location.replace("/");
  };

  const handleEncerrarSessao = () => {
    console.log("[TrocarSenha] Logout iniciado");
    signOut().finally(() => {
      console.log("[TrocarSenha] Redirecionando...");
    });
    window.location.replace("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center items-center gap-2">
            <Link to="/">
              <img src={logo} alt="Logo" style={{ height: "40px" }} />
            </Link>
            <div className="flex items-center gap-2 justify-center">
              <KeyRound className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-heading">
                Defina sua Senha
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Este é seu primeiro acesso. Crie uma senha pessoal para continuar.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Nova senha */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground block">
                Nova Senha
              </label>
              <div className="relative">
                <Input
                  type={showNova ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNova((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNova ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Indicador de força */}
              {novaSenha.length > 0 && <PasswordStrength senha={novaSenha} />}
            </div>

            {/* Confirmar */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground block">
                Confirmar Senha
              </label>
              <div className="relative">
                <Input
                  type={showConfirmar ? "text" : "password"}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmar ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmar.length > 0 && novaSenha !== confirmar && (
                <p className="text-xs text-destructive">
                  As senhas não coincidem.
                </p>
              )}
            </div>

            <Button
              onClick={handleTrocar}
              disabled={
                loading || novaSenha.length < 8 || novaSenha !== confirmar
              }
              className="w-full gradient-hero text-primary-foreground border-0"
            >
              {loading ? "Salvando..." : "Definir Senha e Entrar"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Prefere sair?{" "}
              <button
                onClick={handleEncerrarSessao}
                className="underline hover:text-foreground"
              >
                Encerrar sessão
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

// Componente auxiliar: indicador visual de força da senha
function PasswordStrength({ senha }: { senha: string }) {
  const checks = [
    senha.length >= 8,
    /[A-Z]/.test(senha),
    /[0-9]/.test(senha),
    /[^A-Za-z0-9]/.test(senha),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Muito fraca", "Fraca", "Razoável", "Forte", "Muito forte"];
  const colors = [
    "bg-destructive",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-secondary",
    "bg-secondary",
  ];

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < score ? colors[score] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{labels[score]}</p>
    </div>
  );
}

export default TrocarSenha;
