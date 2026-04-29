import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  MoreVertical,
  UserX,
  Copy,
  Check,
  KeyRound,
} from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { StatusBadge } from "@/components/admin-shared/StatusBadge";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users } from "lucide-react";

const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function Usuarios() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal de senha provisória
  const [senhaModal, setSenhaModal] = useState<{
    nome: string;
    email: string;
    senha: string;
  } | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Formulário novo associado
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error("Erro ao carregar usuários.");
    setUsers(data ?? []);
    setLoading(false);
  };

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(q.toLowerCase()) ||
          u.cpf?.includes(q),
      ),
    [users, q],
  );

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setCpf("");
  };

  const handleCopiarSenha = async () => {
    if (!senhaModal) return;
    await navigator.clipboard.writeText(senhaModal.senha);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleCadastrar = async () => {
    if (!fullName || !email) {
      toast.error("Nome e e-mail são obrigatórios.");
      return;
    }
    setSaving(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      toast.error("Sessão expirada. Faça login novamente.");
      setSaving(false);
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const res = await fetch(`${supabaseUrl}/functions/v1/criar-associado`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName, email, phone, cpf }),
    });

    const result = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(result.error ?? "Erro ao cadastrar associado.");
      return;
    }

    // Fecha o modal de cadastro e abre o modal de senha
    setOpen(false);
    const nomeSalvo = fullName;
    const emailSalvo = email;
    resetForm();
    loadUsers();

    setSenhaModal({
      nome: nomeSalvo,
      email: emailSalvo,
      senha: result.senhaProvisoria,
    });
  };

  const handleStatusChange = async (userId: string, status: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ membership_status: status } as any)
      .eq("id", userId);
    if (error) {
      toast.error("Erro ao atualizar status.");
    } else {
      toast.success("Status atualizado!");
      loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal de senha provisória */}
      <Dialog
        open={!!senhaModal}
        onOpenChange={(v) => {
          if (!v) {
            setSenhaModal(null);
            setCopiado(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Associado cadastrado com sucesso!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Anote a senha provisória abaixo e repasse ao associado. Ela{" "}
              <strong className="text-foreground">
                não será exibida novamente
              </strong>
              .
            </p>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <p className="text-sm font-medium text-foreground">
                {senhaModal?.nome}
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">E-mail</Label>
              <p className="text-sm font-medium text-foreground">
                {senhaModal?.email}
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Senha Provisória
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-3">
                  <span className="font-mono text-base font-semibold tracking-widest text-foreground">
                    {senhaModal?.senha}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopiarSenha}
                  className="h-12 w-12 shrink-0"
                >
                  {copiado ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copiado && (
                <p className="text-xs text-green-600">Senha copiada!</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              O associado deverá trocar essa senha no primeiro acesso.
            </p>

            <div className="flex justify-end pt-1">
              <Button
                onClick={() => {
                  setSenhaModal(null);
                  setCopiado(false);
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="Usuários"
        description="Associados cadastrados na plataforma."
        action={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-success text-success-foreground hover:bg-success/90 shadow-soft-sm">
                <Plus className="mr-2 h-4 w-4" /> Novo Associado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Cadastrar Associado
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="João da Silva"
                  />
                </div>
                <div>
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="associado@email.com"
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(14) 99999-0000"
                  />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCadastrar} disabled={saving}>
                    {saving ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="border-border p-4 shadow-soft-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 bg-muted/40 pl-9"
          />
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Carregando...
        </p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum associado encontrado"
          description="Tente outro termo ou cadastre um novo associado."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((u) => (
            <Card
              key={u.id}
              className="group relative border-border p-4 shadow-soft-sm transition-all hover:-translate-y-0.5 hover:shadow-soft-md"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-background">
                  <AvatarFallback className="bg-gradient-primary font-semibold text-primary-foreground text-sm">
                    {initials(u.full_name || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-display text-sm font-semibold text-foreground">
                      {u.full_name || "Sem nome"}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="-mr-2 -mt-1 h-7 w-7"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(u.id, "ativo")}
                        >
                          Marcar como Ativo
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(u.id, "inadimplente")
                          }
                        >
                          Marcar como Inadimplente
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(u.id, "suspenso")}
                          className="text-destructive focus:text-destructive"
                        >
                          <UserX className="mr-2 h-3.5 w-3.5" /> Suspender
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.phone || u.cpf || "—"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Associado
                    </span>
                    <StatusBadge status={u.membership_status ?? "ativo"} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
