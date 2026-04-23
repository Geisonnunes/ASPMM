import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Users,
  CalendarDays,
  Megaphone,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Metrics {
  totalReservas: number;
  totalAssociados: number;
  eventosProximos: number;
  avisosAtivos: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics>({
    totalReservas: 0,
    totalAssociados: 0,
    eventosProximos: 0,
    avisosAtivos: 0,
  });
  const [reservasRecentes, setReservasRecentes] = useState<any[]>([]);
  const [eventosProximos, setEventosProximos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    const [
      { count: totalReservas },
      { count: totalAssociados },
      { count: eventosProximos },
      { count: avisosAtivos },
      { data: reservas },
      { data: eventos },
    ] = await Promise.all([
      supabase.from("reservations").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("status", "aberto"),
      supabase
        .from("announcements")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("reservations")
        .select(
          "id, status, reservation_date, start_time, profiles(full_name), facilities(name)",
        )
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("events")
        .select("id, title, event_date, location, status")
        .eq("status", "aberto")
        .order("event_date", { ascending: true })
        .limit(4),
    ]);

    setMetrics({
      totalReservas: totalReservas ?? 0,
      totalAssociados: totalAssociados ?? 0,
      eventosProximos: eventosProximos ?? 0,
      avisosAtivos: avisosAtivos ?? 0,
    });
    setReservasRecentes(reservas ?? []);
    setEventosProximos(eventos ?? []);
    setLoading(false);
  };

  const metricCards = [
    {
      label: "Total de reservas",
      value: metrics.totalReservas,
      icon: CalendarCheck,
      color: "success",
      link: "/admin/reservas",
    },
    {
      label: "Associados",
      value: metrics.totalAssociados,
      icon: Users,
      color: "info",
      link: "/admin/usuarios",
    },
    {
      label: "Eventos abertos",
      value: metrics.eventosProximos,
      icon: CalendarDays,
      color: "warning",
      link: "/admin/eventos",
    },
    {
      label: "Avisos ativos",
      value: metrics.avisosAtivos,
      icon: Megaphone,
      color: "primary",
      link: "/admin/avisos",
    },
  ];

  const colorMap: Record<string, string> = {
    success: "bg-success-soft text-success",
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning",
    primary: "bg-accent text-primary",
  };

  const statusColors: Record<string, string> = {
    aprovada: "border-success/30 bg-success-soft text-success",
    pendente: "border-warning/30 bg-warning-soft text-warning",
    recusada: "border-destructive/30 bg-destructive-soft text-destructive",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral"
        description={`Bem-vindo, ${profile?.full_name?.split(" ")[0] ?? "Admin"}! Aqui está o resumo da associação.`}
      />

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((m) => (
          <Card
            key={m.label}
            onClick={() => navigate(m.link)}
            className="group relative cursor-pointer overflow-hidden border-border bg-gradient-card p-5 shadow-soft-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-md"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[m.color]}`}
              >
                <m.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {m.label}
              </p>
              <p className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
                {loading ? "—" : m.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Próximos eventos */}
        <Card className="border-border p-5 shadow-soft-sm lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold">
                Próximos eventos
              </h3>
              <p className="text-xs text-muted-foreground">
                Eventos abertos na associação
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/eventos")}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver todos <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Carregando...
              </p>
            ) : eventosProximos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum evento aberto.
              </p>
            ) : (
              eventosProximos.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-md bg-warning-soft text-warning">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {e.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.event_date).toLocaleDateString("pt-BR")}
                        {e.location && ` · ${e.location}`}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-success/30 bg-success-soft text-success"
                  >
                    {e.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Reservas recentes */}
        <Card className="border-border p-5 shadow-soft-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">
              Reservas recentes
            </h3>
            <button
              onClick={() => navigate("/admin/reservas")}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver tudo <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Carregando...
              </p>
            ) : reservasRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma reserva.
              </p>
            ) : (
              reservasRecentes.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 bg-accent text-primary">
                    <AvatarFallback className="bg-transparent text-xs font-bold text-primary">
                      {r.profiles?.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("") ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {r.profiles?.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.facilities?.name ?? "—"} ·{" "}
                      {new Date(r.reservation_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusColors[r.status]}>
                    {r.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
