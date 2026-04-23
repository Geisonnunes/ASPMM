import { useEffect, useState } from "react";
import { Plus, Megaphone, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Avisos() {
  const [avisos, setAvisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    loadAvisos();
  }, []);

  const loadAvisos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setAvisos(data ?? []);
    setLoading(false);
  };

  const handleCriar = async () => {
    if (!title || !content) {
      toast.error("Título e conteúdo são obrigatórios.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("announcements")
      .insert({ title, content, is_active: true } as any);
    setSaving(false);
    if (error) {
      toast.error("Erro ao criar aviso.");
      return;
    }
    toast.success("Aviso criado!");
    setOpen(false);
    setTitle("");
    setContent("");
    loadAvisos();
  };

  const handleToggle = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("announcements")
      .update({ is_active: !current } as any)
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar.");
      return;
    }
    loadAvisos();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Erro ao excluir.");
      return;
    }
    toast.success("Aviso excluído!");
    loadAvisos();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avisos"
        description="Comunicados exibidos no site para os associados."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-success text-success-foreground hover:bg-success/90 shadow-soft-sm">
                <Plus className="mr-2 h-4 w-4" /> Novo Aviso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Criar Aviso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Conteúdo *</Label>
                  <Textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCriar} disabled={saving}>
                    {saving ? "Criando..." : "Criar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Carregando...
        </p>
      ) : avisos.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nenhum aviso cadastrado" />
      ) : (
        <div className="space-y-3">
          {avisos.map((a) => (
            <Card key={a.id} className="border-border p-5 shadow-soft-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-display text-sm font-semibold text-foreground">
                      {a.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        a.is_active
                          ? "border-success/30 bg-success-soft text-success"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {a.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {a.content}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={a.is_active}
                    onCheckedChange={() => handleToggle(a.id, a.is_active)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(a.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
