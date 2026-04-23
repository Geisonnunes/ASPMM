import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export default function Mensagens() {
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      setMensagens(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensagens"
        description="Mensagens recebidas pelo formulário de contato."
      />
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Carregando...
        </p>
      ) : mensagens.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Nenhuma mensagem recebida"
          description="As mensagens do formulário de contato aparecem aqui."
        />
      ) : (
        <div className="space-y-3">
          {mensagens.map((m) => (
            <Card key={m.id} className="border-border p-5 shadow-soft-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-foreground">
                    {m.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {m.message}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">
                  {new Date(m.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
