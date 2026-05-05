import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMessages(data as ContactMessage[]);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: true })
      .eq("id", id);
    if (error) toast.error(error.message);
    else fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Mensagem excluída");
      fetchMessages();
    }
  };

  const handleExpand = (id: string, read: boolean) => {
    setExpanded(expanded === id ? null : id);
    if (!read) markAsRead(id);
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold font-heading">Mensagens de Contato</h3>
        {unread > 0 && (
          <Badge className="bg-destructive text-destructive-foreground border-0">
            {unread} não lida{unread > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {messages.length === 0 && (
        <p className="text-muted-foreground text-sm">Nenhuma mensagem ainda.</p>
      )}

      {messages.map((m) => (
        <Card
          key={m.id}
          className={`shadow-card cursor-pointer transition-colors ${
            !m.read ? "border-primary/40 bg-primary/5" : ""
          }`}
          onClick={() => handleExpand(m.id, m.read)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {m.read ? (
                  <MailOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                ) : (
                  <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold font-heading text-foreground text-sm">
                      {m.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                    <p className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(m.created_at), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  {expanded !== m.id ? (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {m.message}
                    </p>
                  ) : (
                    <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">
                      {m.message}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMessage(m.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
