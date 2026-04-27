import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Handshake } from "lucide-react";

const CATEGORIES: Record<string, string> = {
  saude: "Saúde",
  estetica: "Estética",
  veiculos: "Veículos",
  alimentacao: "Alimentação",
  educacao: "Educação",
  outros: "Outros",
};

const CATEGORY_COLORS: Record<string, string> = {
  saude: "border-success/30 bg-success-soft text-success",
  estetica: "border-info/30 bg-info-soft text-info",
  veiculos: "border-warning/30 bg-warning-soft text-warning",
  alimentacao: "border-orange-200 bg-orange-50 text-orange-600",
  educacao: "border-purple-200 bg-purple-50 text-purple-600",
  outros: "border-border bg-muted text-muted-foreground",
};

const emptyForm = {
  name: "",
  category: "saude",
  description: "",
  phone: "",
  whatsapp: "",
  address: "",
  website: "",
  logo_url: "",
  is_active: true,
};

export default function Convenios() {
  const [convenios, setConvenios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    loadConvenios();
  }, []);

  const loadConvenios = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("partnerships")
      .select("*")
      .order("order_index", { ascending: true });
    setConvenios(data ?? []);
    setLoading(false);
  };

  const openCriar = () => {
    setEditando(null);
    setForm(emptyForm);
    setLogoPreview("");
    setOpen(true);
  };

  const openEditar = (c: any) => {
    setEditando(c);
    setForm({
      name: c.name ?? "",
      category: c.category ?? "saude",
      description: c.description ?? "",
      phone: c.phone ?? "",
      whatsapp: c.whatsapp ?? "",
      address: c.address ?? "",
      website: c.website ?? "",
      logo_url: c.logo_url ?? "",
      is_active: c.is_active ?? true,
    });
    setLogoPreview(c.logo_url ?? "");
    setOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Máximo 5MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `convenios/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("photos")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error("Erro ao enviar logo.");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    setForm((f) => ({ ...f, logo_url: data.publicUrl }));
    setLogoPreview(data.publicUrl);
    setUploading(false);
    e.target.value = "";
  };

  const handleSalvar = async () => {
    if (!form.name || !form.category) {
      toast.error("Nome e categoria são obrigatórios.");
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name,
      category: form.category,
      description: form.description || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      address: form.address || null,
      website: form.website || null,
      logo_url: form.logo_url || null,
      is_active: form.is_active,
    };

    let error;
    if (editando) {
      ({ error } = await supabase
        .from("partnerships")
        .update(payload as any)
        .eq("id", editando.id));
    } else {
      ({ error } = await supabase
        .from("partnerships")
        .insert({ ...payload, order_index: convenios.length } as any));
    }

    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success(editando ? "Convênio atualizado!" : "Convênio cadastrado!");
    setOpen(false);
    loadConvenios();
  };

  const handleToggle = async (id: string, current: boolean) => {
    await supabase
      .from("partnerships")
      .update({ is_active: !current } as any)
      .eq("id", id);
    setConvenios((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c)),
    );
  };

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase.from("partnerships").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir.");
      return;
    }
    toast.success("Convênio excluído!");
    setConvenios((prev) => prev.filter((c) => c.id !== id));
  };

  const set = (key: string, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convênios"
        description="Parcerias e benefícios disponíveis para os associados."
        action={
          <Button
            onClick={openCriar}
            className="bg-success text-success-foreground hover:bg-success/90 shadow-soft-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Convênio
          </Button>
        }
      />

      {/* Dialog criar/editar */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setOpen(false);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editando ? "Editar Convênio" : "Novo Convênio"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Logo */}
            <div>
              <Label>Logo da Empresa</Label>
              <div className="mt-1">
                {logoPreview ? (
                  <div className="relative w-32 h-32">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-full h-full object-contain rounded-lg border border-border bg-muted/30"
                    />
                    <button
                      onClick={() => {
                        setLogoPreview("");
                        set("logo_url", "");
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/60 transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center">
                      {uploading ? "Enviando..." : "Clique para upload"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label>Nome *</Label>
              <Input
                className="mt-1"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ex: Uniodonto"
              />
            </div>

            <div>
              <Label>Categoria *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descrição dos benefícios</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Descreva os benefícios..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefone</Label>
                <Input
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="(14) 99999-0000"
                />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input
                  className="mt-1"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  placeholder="(14) 99999-0000"
                />
              </div>
            </div>

            <div>
              <Label>Endereço</Label>
              <Input
                className="mt-1"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Ex: Av. Brasil, 123 - Marília"
              />
            </div>
            <div>
              <Label>Site</Label>
              <Input
                className="mt-1"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => set("is_active", v)}
              />
              <Label>Ativo (visível no site)</Label>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvar} disabled={saving || uploading}>
                {saving
                  ? "Salvando..."
                  : editando
                    ? "Salvar alterações"
                    : "Cadastrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Carregando...
        </p>
      ) : convenios.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="Nenhum convênio cadastrado"
          description="Adicione os parceiros da associação."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {convenios.map((c) => (
            <Card
              key={c.id}
              className={`border-border p-4 shadow-soft-sm transition-all hover:-translate-y-0.5 hover:shadow-soft-md ${!c.is_active ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                {c.logo_url ? (
                  <img
                    src={c.logo_url}
                    alt={c.name}
                    className="h-12 w-12 rounded-lg object-contain border border-border bg-muted/30 shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Handshake className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-sm font-semibold text-foreground truncate">
                      {c.name}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] mt-1 ${CATEGORY_COLORS[c.category]}`}
                  >
                    {CATEGORIES[c.category]}
                  </Badge>
                  {c.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {c.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <Switch
                  checked={c.is_active}
                  onCheckedChange={() => handleToggle(c.id, c.is_active)}
                />
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openEditar(c)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(c.id, c.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
