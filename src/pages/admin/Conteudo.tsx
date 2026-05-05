import { useEffect, useState } from "react";
import {
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Trash2,
  Plus,
  Megaphone,
} from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEFAULTS = {
  hero_badge: "Associação dos Servidores Públicos",
  hero_title: "Bem-vindo à",
  hero_title_accent: "ASPMM",
  hero_subtitle:
    "Esporte, lazer e convivência para servidores públicos e suas famílias em Marília.",
  hero_image_url: "",
  editor_title: "",
  editor_description: "",
  stat1_value: "30+",
  stat1_label: "Anos de história",
  stat2_value: "50+",
  stat2_label: "Eventos por ano",
  stat3_value: "800+",
  stat3_label: "Associados ativos",
};

export default function Conteudo() {
  const [values, setValues] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Carrossel
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [uploadingCarousel, setUploadingCarousel] = useState(false);

  // Avisos
  const [avisos, setAvisos] = useState<any[]>([]);
  const [openAviso, setOpenAviso] = useState(false);
  const [savingAviso, setSavingAviso] = useState(false);
  const [avisoTitle, setAvisoTitle] = useState("");
  const [avisoContent, setAvisoContent] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: settings }, { data: images }, { data: avisosData }] =
      await Promise.all([
        supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("hero_images").select("*").order("order_index"),
        supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

    if (settings) {
      const merged = { ...DEFAULTS };
      Object.keys(DEFAULTS).forEach((k) => {
        if (settings[k] !== undefined && settings[k] !== null)
          merged[k] = settings[k];
      });
      setValues(merged);
      setImagePreview(merged.hero_image_url || "");
    }
    setHeroImages(images ?? []);
    setAvisos(avisosData ?? []);
    setLoading(false);
  };

  const handleCriarAviso = async () => {
    if (!avisoTitle || !avisoContent) {
      toast.error("Título e conteúdo são obrigatórios.");
      return;
    }
    setSavingAviso(true);
    const { error } = await supabase.from("announcements").insert({
      title: avisoTitle,
      content: avisoContent,
      is_active: true,
    } as any);
    setSavingAviso(false);
    if (error) {
      toast.error("Erro ao criar aviso.");
      return;
    }
    toast.success("Aviso criado!");
    setOpenAviso(false);
    setAvisoTitle("");
    setAvisoContent("");
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setAvisos(data ?? []);
  };

  const handleToggleAviso = async (id: string, current: boolean) => {
    await supabase
      .from("announcements")
      .update({ is_active: !current } as any)
      .eq("id", id);
    setAvisos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active: !current } : a)),
    );
  };

  const handleDeleteAviso = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    setAvisos((prev) => prev.filter((a) => a.id !== id));
    toast.success("Aviso excluído!");
  };

  const set = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Máximo 10MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `hero/banner_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("photos")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error("Erro ao enviar: " + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    set("hero_image_url", data.publicUrl);
    setImagePreview(data.publicUrl);
    setUploading(false);
    toast.success("Imagem enviada! Clique em Salvar para aplicar.");
    e.target.value = "";
  };

  const handleCarouselUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingCarousel(true);

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} excede 10MB.`);
        continue;
      }
      const ext = file.name.split(".").pop();
      const path = `hero/carousel_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("photos")
        .upload(path, file, { upsert: true });
      if (error) {
        toast.error(`Erro ao enviar ${file.name}.`);
        continue;
      }
      const { data } = supabase.storage.from("photos").getPublicUrl(path);
      await supabase.from("hero_images").insert({
        url: data.publicUrl,
        order_index: heroImages.length,
        is_active: true,
      } as any);
    }

    setUploadingCarousel(false);
    e.target.value = "";
    toast.success("Imagens adicionadas ao carrossel!");
    const { data } = await supabase
      .from("hero_images")
      .select("*")
      .order("order_index");
    setHeroImages(data ?? []);
  };

  const handleToggleImage = async (id: string, current: boolean) => {
    await supabase
      .from("hero_images")
      .update({ is_active: !current } as any)
      .eq("id", id);
    setHeroImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, is_active: !current } : img,
      ),
    );
  };

  const handleDeleteImage = async (id: string) => {
    await supabase.from("hero_images").delete().eq("id", id);
    setHeroImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("Imagem removida!");
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ ...values } as any)
      .eq("id", 1);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Conteúdo salvo com sucesso!");
  };

  if (loading)
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        Carregando...
      </p>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conteúdo do Site"
        description="Edite os textos e imagens exibidos no site."
        action={
          <Button
            onClick={handleSave}
            disabled={saving}
            className="shadow-soft-sm"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        }
      />

      <Tabs defaultValue="carrossel">
        <TabsList>
          <TabsTrigger value="carrossel">Carrossel do Banner</TabsTrigger>
          <TabsTrigger value="banner">Textos do Banner</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="destaque">Bloco de Destaque</TabsTrigger>
          <TabsTrigger value="avisos">Avisos</TabsTrigger>
        </TabsList>

        {/* ─── ABA CARROSSEL ──────────────────────────────── */}
        <TabsContent value="carrossel" className="mt-6">
          <Card className="border-border p-6 shadow-soft-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Imagens do Carrossel
                </p>
                <p className="text-xs text-muted-foreground">
                  As imagens ficam passando automaticamente no banner do site.
                </p>
              </div>
              <label
                className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-success text-success-foreground hover:bg-success/90 shadow-soft-sm transition-colors ${uploadingCarousel ? "opacity-60 pointer-events-none" : ""}`}
              >
                <Plus className="h-4 w-4" />
                {uploadingCarousel ? "Enviando..." : "Adicionar imagens"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleCarouselUpload}
                  disabled={uploadingCarousel}
                />
              </label>
            </div>

            {heroImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg text-muted-foreground">
                <ImageIcon className="h-8 w-8 mb-2" />
                <p className="text-sm">Nenhuma imagem no carrossel ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {heroImages.map((img, i) => (
                  <div
                    key={img.id}
                    className={`relative group rounded-lg overflow-hidden border ${img.is_active ? "border-border" : "border-dashed border-muted-foreground/30 opacity-50"}`}
                  >
                    <img
                      src={img.url}
                      alt={`Slide ${i + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="bg-destructive text-destructive-foreground rounded-full p-1.5 hover:opacity-90"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-2 py-1 bg-black/50">
                      <span className="text-[10px] text-white">
                        Slide {i + 1}
                      </span>
                      <Switch
                        checked={img.is_active}
                        onCheckedChange={() =>
                          handleToggleImage(img.id, img.is_active)
                        }
                        className="scale-75"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Recomendado: 1920×800px, máximo 10MB por imagem. Use o switch para
              ativar/desativar cada slide.
            </p>
          </Card>
        </TabsContent>

        {/* ─── ABA TEXTOS DO BANNER ───────────────────────── */}
        <TabsContent value="banner" className="mt-6">
          <Card className="border-border p-6 shadow-soft-sm space-y-5">
            <div>
              <Label>Badge (etiqueta pequena acima do título)</Label>
              <Input
                className="mt-1"
                value={values.hero_badge}
                onChange={(e) => set("hero_badge", e.target.value)}
                placeholder={DEFAULTS.hero_badge}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Título</Label>
                <Input
                  className="mt-1"
                  value={values.hero_title}
                  onChange={(e) => set("hero_title", e.target.value)}
                  placeholder={DEFAULTS.hero_title}
                />
              </div>
              <div>
                <Label>Título em destaque (amarelo)</Label>
                <Input
                  className="mt-1"
                  value={values.hero_title_accent}
                  onChange={(e) => set("hero_title_accent", e.target.value)}
                  placeholder={DEFAULTS.hero_title_accent}
                />
              </div>
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={values.hero_subtitle}
                onChange={(e) => set("hero_subtitle", e.target.value)}
                placeholder={DEFAULTS.hero_subtitle}
              />
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="relative h-36 bg-muted flex items-center">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {heroImages.filter((i) => i.is_active)[0] && !imagePreview && (
                  <img
                    src={heroImages.filter((i) => i.is_active)[0].url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
                <div className="relative z-10 px-6">
                  <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-green-500 text-white">
                    {values.hero_badge || DEFAULTS.hero_badge}
                  </span>
                  <h3 className="text-white text-lg font-bold leading-tight">
                    {values.hero_title || DEFAULTS.hero_title}{" "}
                    <span className="text-yellow-400">
                      {values.hero_title_accent || DEFAULTS.hero_title_accent}
                    </span>
                  </h3>
                  <p className="text-white/70 text-xs mt-1 line-clamp-2">
                    {values.hero_subtitle || DEFAULTS.hero_subtitle}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center py-1.5 bg-muted/50">
                Pré-visualização do banner
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* ─── ABA STATS ──────────────────────────────────── */}
        <TabsContent value="stats" className="mt-6">
          <Card className="border-border p-6 shadow-soft-sm space-y-6">
            <p className="text-sm text-muted-foreground">
              Esses números aparecem na faixa azul abaixo do banner.
            </p>
            {[1, 2, 3].map((n) => (
              <div key={n} className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número {n}</Label>
                  <Input
                    className="mt-1"
                    value={values[`stat${n}_value`]}
                    onChange={(e) => set(`stat${n}_value`, e.target.value)}
                  />
                </div>
                <div>
                  <Label>Legenda {n}</Label>
                  <Input
                    className="mt-1"
                    value={values[`stat${n}_label`]}
                    onChange={(e) => set(`stat${n}_label`, e.target.value)}
                  />
                </div>
              </div>
            ))}
            <div className="rounded-lg bg-primary p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[1, 2, 3].map((n) => (
                  <div key={n}>
                    <p className="text-2xl font-extrabold text-primary-foreground">
                      {values[`stat${n}_value`]}
                    </p>
                    <p className="text-xs text-primary-foreground/70 mt-1">
                      {values[`stat${n}_label`]}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-primary-foreground/50 text-center mt-4">
                Pré-visualização
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* ─── ABA AVISOS ─────────────────────────────────── */}
        <TabsContent value="avisos" className="mt-6">
          <Card className="border-border p-6 shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Avisos do Site
                </p>
                <p className="text-xs text-muted-foreground">
                  Comunicados exibidos na barra de avisos para os associados.
                </p>
              </div>
              <Dialog open={openAviso} onOpenChange={setOpenAviso}>
                <DialogTrigger asChild>
                  <Button className="bg-success text-success-foreground hover:bg-success/90 shadow-soft-sm">
                    <Plus className="mr-2 h-4 w-4" /> Novo Aviso
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">
                      Criar Aviso
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label>Título *</Label>
                      <Input
                        value={avisoTitle}
                        onChange={(e) => setAvisoTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Conteúdo *</Label>
                      <Textarea
                        rows={4}
                        value={avisoContent}
                        onChange={(e) => setAvisoContent(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setOpenAviso(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleCriarAviso} disabled={savingAviso}>
                        {savingAviso ? "Criando..." : "Criar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {avisos.length === 0 ? (
              <EmptyState icon={Megaphone} title="Nenhum aviso cadastrado" />
            ) : (
              <div className="space-y-3">
                {avisos.map((a) => (
                  <Card key={a.id} className="border-border p-4 shadow-soft-sm">
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
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={a.is_active}
                          onCheckedChange={() =>
                            handleToggleAviso(a.id, a.is_active)
                          }
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteAviso(a.id)}
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
          </Card>
        </TabsContent>

        {/* ─── ABA DESTAQUE ───────────────────────────────── */}
        <TabsContent value="destaque" className="mt-6">
          <Card className="border-border p-6 shadow-soft-sm space-y-5">
            <p className="text-sm text-muted-foreground">
              Bloco opcional entre o banner e os avisos. Deixe em branco para
              ocultar.
            </p>
            <div>
              <Label>Título</Label>
              <Input
                className="mt-1"
                value={values.editor_title}
                onChange={(e) => set("editor_title", e.target.value)}
                placeholder="Ex: Novidades do clube"
              />
            </div>
            <div>
              <Label>Texto</Label>
              <Textarea
                className="mt-1"
                rows={4}
                value={values.editor_description}
                onChange={(e) => set("editor_description", e.target.value)}
                placeholder="Ex: Confira as novidades!"
              />
            </div>
            {(values.editor_title || values.editor_description) && (
              <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
                {values.editor_title && (
                  <h3 className="text-lg font-bold font-heading text-foreground">
                    {values.editor_title}
                  </h3>
                )}
                {values.editor_description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {values.editor_description}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground/50 mt-4">
                  Pré-visualização
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
