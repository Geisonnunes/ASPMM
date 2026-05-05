import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { StatusBadge } from "@/components/admin-shared/StatusBadge";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Reservas() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reservations")
      .select("*, profiles(full_name), facilities(name)")
      .order("created_at", { ascending: false });
    setReservas(data ?? []);
    setLoading(false);
  };

  const filtered = useMemo(
    () =>
      reservas.filter(
        (r) =>
          r.profiles?.full_name?.toLowerCase().includes(q.toLowerCase()) ||
          r.facilities?.name?.toLowerCase().includes(q.toLowerCase()),
      ),
    [reservas, q],
  );

  const handleStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar.");
      return;
    }
    toast.success("Status atualizado!");
    loadReservas();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservas"
        description="Solicitações de uso dos espaços da associação."
      />

      <Card className="border-border p-4 shadow-soft-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por associado ou espaço..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 bg-muted/40 pl-9"
          />
        </div>
      </Card>

      <Card className="border-border shadow-soft-sm">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Carregando...
          </p>
        ) : filtered.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="Nenhuma reserva encontrada" />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 bg-accent">
                    <AvatarFallback className="bg-transparent text-xs font-bold text-primary">
                      {r.profiles?.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("") ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {r.profiles?.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.facilities?.name ?? "—"} ·{" "}
                      {new Date(r.reservation_date).toLocaleDateString("pt-BR")}{" "}
                      · {r.start_time?.slice(0, 5)}–{r.end_time?.slice(0, 5)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={r.status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleStatus(r.id, "aprovada")}
                      >
                        Aprovar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatus(r.id, "pendente")}
                      >
                        Pendente
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatus(r.id, "recusada")}
                        className="text-destructive focus:text-destructive"
                      >
                        Recusar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
