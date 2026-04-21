import { useState } from "react";
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

/**
 * Página de login — aceita e-mail OU CPF.
 * Após autenticar, verifica must_change_password:
 *   true  → redireciona para /trocar-senha
 *   false → redireciona para /
 */
const Login = () => {
  const [identificador, setIdentificador] = useState(""); // email ou CPF
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /** Se parece com CPF (só dígitos/pontos/traço), busca o email correspondente. */
  const resolverEmail = async (valor: string): Promise<string | null> => {
    const eCPF = /^[\d.\-]+$/.test(valor.trim());
    if (!eCPF) return valor.trim(); // já é email

    // Remove máscara e busca email via RPC segura
    const cpfLimpo = valor.replace(/\D/g, "");
    const { data, error } = await supabase.rpc("get_email_by_cpf", {
      p_cpf: cpfLimpo,
    });

    if (error || !data) {
      toast.error("CPF não encontrado. Verifique e tente novamente.");
      return null;
    }
    return data as string;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Resolve email (pode vir como CPF)
    const email = await resolverEmail(identificador);
    if (!email) {
      setLoading(false);
      return;
    }

    // 2. Autentica
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      toast.error("Credenciais inválidas. Verifique e tente novamente.");
      setLoading(false);
      return;
    }

    // 3. Busca must_change_password no profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("must_change_password")
      .eq("user_id", data.user.id)
      .single<{ must_change_password: boolean }>();

    setLoading(false);

    if (profile?.must_change_password) {
      toast.info("Por segurança, defina uma nova senha antes de continuar.");
      navigate("/trocar-senha", { replace: true });
    } else {
      toast.success("Bem-vindo de volta!");
      navigate("/");
    }
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
              Entrar na ASPMM
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Use seu e-mail ou CPF para acessar
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  E-mail ou CPF
                </label>
                <Input
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  placeholder="seu@email.com ou 000.000.000-00"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-primary-foreground border-0"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
