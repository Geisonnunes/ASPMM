import { useEffect, useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export default function Mensagens() {
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    loadMensagens();
  }, []);

  const loadMensagens = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    const msgs = data ?? [];
    setMensagens(msgs);
    if (msgs.length > 0) setSelected(msgs[0]);
    setLoading(false);
  };

  const handleSelect = async (m: any) => {
    setSelected(m);
    if (!m.is_read) {
      await supabase
        .from("contact_messages")
        .update({ is_read: true } as any)
        .eq("id", m.id);
      setMensagens((prev) =>
        prev.map((msg) => (msg.id === m.id ? { ...msg, is_read: true } : msg)),
      );
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Erro ao excluir mensagem.");
      return;
    }
    toast.success("Mensagem excluída!");
    const remaining = mensagens.filter((m) => m.id !== id);
    setMensagens(remaining);
    setSelected(remaining.length > 0 ? remaining[0] : null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensagens"
        description="Caixa de entrada da associação."
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
        <div className="flex gap-0 rounded-xl border border-border overflow-hidden shadow-soft-sm min-h-[500px]">
          {/* Lista de mensagens */}
          <div className="w-80 shrink-0 border-r border-border bg-card overflow-y-auto">
            {mensagens.map((m) => (
              <div
                key={m.id}
                onClick={() => handleSelect(m)}
                className={`flex items-start gap-3 px-4 py-4 cursor-pointer border-b border-border transition-colors ${
                  selected?.id === m.id
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {m.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-sm truncate ${!m.is_read ? "font-bold text-foreground" : "font-medium text-foreground"}`}
                    >
                      {m.name}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] text-muted-foreground">
                        {timeAgo(m.created_at)}
                      </span>
                      {!m.is_read && (
                        <span className="h-2 w-2 rounded-full bg-destructive" />
                      )}
                    </div>
                  </div>
                  {m.subject && (
                    <p className="text-xs font-medium text-foreground/80 truncate">
                      {m.subject}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {m.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Visualização da mensagem */}
          {selected ? (
            <div className="flex-1 flex flex-col bg-background">
              {/* Header da mensagem */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                      {selected.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {selected.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selected.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(selected.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Corpo da mensagem */}
              <div className="flex-1 px-6 py-6">
                {selected.subject && (
                  <h2 className="text-lg font-semibold font-display text-foreground mb-1">
                    {selected.subject}
                  </h2>
                )}
                <p className="text-xs text-muted-foreground mb-6">
                  Recebida em{" "}
                  {new Date(selected.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Selecione uma mensagem para visualizar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
