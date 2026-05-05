import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logo from "@/assets/logo.png";

const RedefinirSenha = () => {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessaoValida, setSessaoValida] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se há sessão ativa vinda do link de recuperação
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessaoValida(true);
      }
    });

    // Escuta o evento de recuperação de senha
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessaoValida(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setLoading(false);

    if (error) {
      toast.error("Erro ao redefinir senha. Tente novamente.");
      return;
    }

    toast.success("Senha redefinida com sucesso!");
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
            <CardTitle className="text-2xl font-heading">
              Redefinir Senha
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {sessaoValida
                ? "Escolha uma nova senha para sua conta."
                : "Link inválido ou expirado. Solicite um novo."}
            </p>
          </CardHeader>

          <CardContent>
            {!sessaoValida ? (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/recuperar-senha">Solicitar novo link</Link>
              </Button>
            ) : (
              <form onSubmit={handleRedefinir} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showNova ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNova((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNova ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmar ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Repita a nova senha"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmar ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Salvando..." : "Redefinir Senha"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default RedefinirSenha;
