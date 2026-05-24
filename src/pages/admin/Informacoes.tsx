import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  HelpCircle,
  ScrollText,
  Save,
} from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Informacoes() {
  const [faq, setFaq] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Formulário nova pergunta
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: faqData }, { data: settingsData }] = await Promise.all([
      supabase.from("faq").select("*").order("order_index"),
      supabase.from("info_settings").select("*").limit(1).single(),
    ]);
    setFaq(faqData ?? []);
    setSettings(settingsData);
    setLoading(false);
  };

  const handleCriarFaq = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error("Pergunta e resposta são obrigatórias.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("faq").insert({
      question: question.trim(),
      answer: answer.trim(),
      order_index: faq.length,
      is_active: true,
    } as any);
    setSaving(false);
    if (error) {
      toast.error("Erro ao criar pergunta.");
      return;
    }
    toast.success("Pergunta adicionada!");
    setOpen(false);
    setQuestion("");
    setAnswer("");
    loadAll();
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Deseja excluir esta pergunta?")) return;
    const { error } = await supabase.from("faq").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir.");
      return;
    }
    toast.success("Pergunta excluída!");
    loadAll();
  };

  const handleToggleFaq = async (id: string, current: boolean) => {
    await supabase
      .from("faq")
      .update({ is_active: !current } as any)
      .eq("id", id);
    loadAll();
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const { error } = await supabase
      .from("info_settings")
      .update({
        show_faq: settings.show_faq,
        show_regulamento: settings.show_regulamento,
        regulamento_content: settings.regulamento_content,
      } as any)
      .eq("id", settings.id);
    setSavingSettings(false);
    if (error) {
      toast.error("Erro ao salvar configurações.");
      return;
    }
    toast.success("Configurações salvas!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Informações"
        description="Gerencie as perguntas frequentes e o regulamento do clube."
      />

      <Tabs defaultValue="faq">
        <TabsList>
          <TabsTrigger value="faq" className="gap-2">
            <HelpCircle className="h-4 w-4" /> Perguntas Frequentes
          </TabsTrigger>
          <TabsTrigger value="regulamento" className="gap-2">
            <ScrollText className="h-4 w-4" /> Regulamento
          </TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        {/* ─── ABA FAQ ─────────────────────────────────────────────────── */}
        <TabsContent value="faq" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-success text-success-foreground hover:bg-success/90 shadow-soft-sm">
                  <Plus className="mr-2 h-4 w-4" /> Nova Pergunta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">
                    Adicionar Pergunta
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label>Pergunta *</Label>
                    <Input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ex: Como faço para me associar?"
                    />
                  </div>
                  <div>
                    <Label>Resposta *</Label>
                    <Textarea
                      rows={4}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Digite a resposta..."
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCriarFaq} disabled={saving}>
                      {saving ? "Salvando..." : "Adicionar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Carregando...
            </p>
          ) : faq.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Nenhuma pergunta cadastrada.
            </p>
          ) : (
            <div className="space-y-3">
              {faq.map((item) => (
                <Card
                  key={item.id}
                  className="border-border p-4 shadow-soft-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {item.question}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.answer}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={item.is_active}
                        onCheckedChange={() =>
                          handleToggleFaq(item.id, item.is_active)
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteFaq(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── ABA REGULAMENTO ─────────────────────────────────────────── */}
        <TabsContent value="regulamento" className="mt-6">
          <Card className="border-border p-6 shadow-soft-sm space-y-4">
            <div>
              <Label>Conteúdo do Regulamento</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Se vazio, será exibido o regulamento padrão do sistema.
              </p>
              <Textarea
                rows={12}
                value={settings?.regulamento_content ?? ""}
                onChange={(e) =>
                  setSettings((s: any) => ({
                    ...s,
                    regulamento_content: e.target.value,
                  }))
                }
                placeholder="Digite o regulamento completo aqui..."
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={savingSettings}>
                <Save className="mr-2 h-4 w-4" />
                {savingSettings ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ─── ABA CONFIGURAÇÕES ───────────────────────────────────────── */}
        <TabsContent value="configuracoes" className="mt-6">
          <Card className="border-border p-6 shadow-soft-sm space-y-6">
            <p className="text-sm text-muted-foreground">
              Controle quais seções aparecem na página pública de Informações.
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Perguntas Frequentes
                </p>
                <p className="text-xs text-muted-foreground">
                  Exibe o FAQ na página pública
                </p>
              </div>
              <Switch
                checked={settings?.show_faq ?? true}
                onCheckedChange={(v) =>
                  setSettings((s: any) => ({ ...s, show_faq: v }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Regulamento
                </p>
                <p className="text-xs text-muted-foreground">
                  Exibe o regulamento na página pública
                </p>
              </div>
              <Switch
                checked={settings?.show_regulamento ?? true}
                onCheckedChange={(v) =>
                  setSettings((s: any) => ({ ...s, show_regulamento: v }))
                }
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={savingSettings}>
                <Save className="mr-2 h-4 w-4" />
                {savingSettings ? "Salvando..." : "Salvar configurações"}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
