import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, MoreVertical, UserX, Pencil } from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { StatusBadge } from "@/components/admin-shared/StatusBadge";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
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

  const handleCadastrar = async () => {
    if (!fullName || !email) {
      toast.error("Nome e e-mail são obrigatórios.");
      return;
    }
    setSaving(true);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
    const array = new Uint8Array(12);
    crypto.getRandomValues(array);
    const senhaProvisoria = Array.from(
      array,
      (b) => chars[b % chars.length],
    ).join("");

    const resUser = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({
        email,
        password: senhaProvisoria,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      }),
    });

    const userData = await resUser.json();
    if (!resUser.ok) {
      toast.error("Erro ao cadastrar: " + (userData?.msg ?? userData?.message));
      setSaving(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 1500));

    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        cpf: cpf ? cpf.replace(/\D/g, "") : null,
        must_change_password: true,
      } as any)
      .eq("id", userData.id);

    toast.success(
      `Associado "${fullName}" cadastrado! Senha provisória: ${senhaProvisoria}`,
    );
    setOpen(false);
    resetForm();
    loadUsers();
    setSaving(false);
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
