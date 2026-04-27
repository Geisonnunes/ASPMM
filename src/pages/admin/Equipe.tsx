import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Upload, X, Users } from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emptyForm = {
  name: "",
  role: "",
  photo_url: "",
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  whatsapp: "",
  is_active: true,
};

export default function Equipe() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("staff")
      .select("*")
      .order("order_index");
    setStaff(data ?? []);
    setLoading(false);
  };

  const openCriar = () => {
    setEditando(null);
    setForm(emptyForm);
    setPhotoPreview("");
    setOpen(true);
  };

  const openEditar = (s: any) => {
    setEditando(s);
    setForm({
      name: s.name ?? "",
      role: s.role ?? "",
      photo_url: s.photo_url ?? "",
      facebook_url: s.facebook_url ?? "",
      twitter_url: s.twitter_url ?? "",
      instagram_url: s.instagram_url ?? "",
      whatsapp: s.whatsapp ?? "",
      is_active: s.is_active ?? true,
    });
    setPhotoPreview(s.photo_url ?? "");
    setOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Máximo 5MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `equipe/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("photos")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error("Erro ao enviar foto.");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    set("photo_url", data.publicUrl);
    setPhotoPreview(data.publicUrl);
    setUploading(false);
    e.target.value = "";
  };

  const handleSalvar = async () => {
    if (!form.name || !form.role) {
      toast.error("Nome e cargo são obrigatórios.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      role: form.role,
      photo_url: form.photo_url || null,
      facebook_url: form.facebook_url || null,
      twitter_url: form.twitter_url || null,
      instagram_url: form.instagram_url || null,
      whatsapp: form.whatsapp || null,
      is_active: form.is_active,
    };
    let error;
    if (editando) {
      ({ error } = await supabase
        .from("staff")
        .update(payload as any)
        .eq("id", editando.id));
    } else {
      ({ error } = await supabase
        .from("staff")
        .insert({ ...payload, order_index: staff.length } as any));
    }
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar.");
      return;
    }
    toast.success(editando ? "Membro atualizado!" : "Membro adicionado!");
    setOpen(false);
    loadStaff();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("staff").delete().eq("id", id);
    toast.success("Membro removido!");
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggle = async (id: string, current: boolean) => {
    await supabase
      .from("staff")
      .update({ is_active: !current } as any)
      .eq("id", id);
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !current } : s)),
    );
  };

  const set = (key: string, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipe"
        description="Gerencie os membros da diretoria exibidos no site."
        action={
          <Button
            onClick={openCriar}
            className="bg-success text-success-foreground hover:bg-success/90 shadow-soft-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Membro
          </Button>
        }
      />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setOpen(false);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editando ? "Editar Membro" : "Novo Membro"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Foto */}
            <div>
              <Label>Foto</Label>
              <div className="mt-1">
                {photoPreview ? (
                  <div className="relative w-28 h-28">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl border border-border"
                    />
                    <button
                      onClick={() => {
                        setPhotoPreview("");
                        set("photo_url", "");
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/60 transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">
                      {uploading ? "Enviando..." : "Foto"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
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
                placeholder="Ex: Joel Rocha"
              />
            </div>
            <div>
              <Label>Cargo *</Label>
              <Input
                className="mt-1"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="Ex: Presidente do Clube"
              />
            </div>

            <div className="h-px bg-border" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Redes Sociais (opcional)
            </p>

            <div>
              <Label>Facebook</Label>
              <Input
                className="mt-1"
                value={form.facebook_url}
                onChange={(e) => set("facebook_url", e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <Label>Twitter / X</Label>
              <Input
                className="mt-1"
                value={form.twitter_url}
                onChange={(e) => set("twitter_url", e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input
                className="mt-1"
                value={form.instagram_url}
                onChange={(e) => set("instagram_url", e.target.value)}
                placeholder="https://instagram.com/..."
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
                {saving ? "Salvando..." : editando ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Carregando...
        </p>
      ) : staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum membro cadastrado"
          description="Adicione os membros da diretoria."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {staff.map((s) => (
            <Card
              key={s.id}
              className={`border-border p-4 shadow-soft-sm flex items-center gap-4 ${!s.is_active ? "opacity-60" : ""}`}
            >
              {s.photo_url ? (
                <img
                  src={s.photo_url}
                  alt={s.name}
                  className="h-14 w-14 rounded-xl object-cover border border-border shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">
                    {s.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-semibold text-foreground truncate">
                  {s.name}
                </p>
                <p className="text-xs text-muted-foreground">{s.role}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Switch
                  checked={s.is_active}
                  onCheckedChange={() => handleToggle(s.id, s.is_active)}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => openEditar(s)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(s.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
