import { useEffect, useState } from "react";
import { CalendarDays, Users, Megaphone, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Metrics {
  totalAssociados: number;
  eventosAbertos: number;
  avisosAtivos: number;
  totalAlbuns: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics>({
    totalAssociados: 0,
    eventosAbertos: 0,
    avisosAtivos: 0,
    totalAlbuns: 0,
  });
  const [eventosProximos, setEventosProximos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const [
      { count: totalAssociados },
      { count: eventosAbertos },
      { count: avisosAtivos },
      { count: totalAlbuns },
      { data: eventos },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("status", "aberto"),
      supabase
        .from("announcements")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase.from("photo_albums").select("*", { count: "exact", head: true }),
      supabase
        .from("events")
        .select("id, title, event_date, location, status")
        .eq("status", "aberto")
        .order("event_date", { ascending: true })
        .limit(5),
    ]);

    setMetrics({
      totalAssociados: totalAssociados ?? 0,
      eventosAbertos: eventosAbertos ?? 0,
      avisosAtivos: avisosAtivos ?? 0,
      totalAlbuns: totalAlbuns ?? 0,
    });
    setEventosProximos(eventos ?? []);
    setLoading(false);
  };

  const metricCards = [
    {
      label: "Associados",
      value: metrics.totalAssociados,
      icon: Users,
      color: "info",
      link: "/admin/usuarios",
    },
    {
      label: "Eventos abertos",
      value: metrics.eventosAbertos,
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
    {
      label: "Álbuns na galeria",
      value: metrics.totalAlbuns,
      icon: CalendarDays,
      color: "success",
      link: "/admin/galeria",
    },
  ];

  const colorMap: Record<string, string> = {
    success: "bg-success-soft text-success",
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning",
    primary: "bg-accent text-primary",
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

      {/* Próximos eventos — agora ocupa a largura total */}
      <Card className="border-border p-5 shadow-soft-sm">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning-soft text-warning">
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
    </div>
  );
}
