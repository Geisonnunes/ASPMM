import { useEffect, useState } from "react";
import {
  Plus,
  CalendarDays,
  MoreVertical,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { StatusBadge } from "@/components/admin-shared/StatusBadge";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emptyForm = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  max_attendees: "",
  status: "aberto",
  image_url: "",
};

export default function Eventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState<any | null>(null); // null = criando, objeto = editando
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });
    setEventos(data ?? []);
    setLoading(false);
  };

  const openCriar = () => {
    setEditando(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setOpen(true);
  };

  const openEditar = (evento: any) => {
    setEditando(evento);
    setForm({
      title: evento.title ?? "",
      description: evento.description ?? "",
      event_date: evento.event_date ? evento.event_date.slice(0, 16) : "",
      location: evento.location ?? "",
      max_attendees: evento.max_attendees ? String(evento.max_attendees) : "",
      status: evento.status ?? "aberto",
      image_url: evento.image_url ?? "",
    });
    setImageFile(null);
    setImagePreview(evento.image_url ?? "");
    setOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImagem = async (): Promise<string | null> => {
    if (!imageFile) return form.image_url || null;
    setUploading(true);
    const ext = imageFile.name.split(".").pop();
    const path = `eventos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("photos")
      .upload(path, imageFile, { upsert: true });
    setUploading(false);
    if (error) {
      toast.error("Erro ao fazer upload da imagem: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSalvar = async () => {
    if (!form.title || !form.event_date) {
      toast.error("Título e data são obrigatórios.");
      return;
    }
    setSaving(true);

    const imageUrl = await uploadImagem();

    const payload = {
      title: form.title,
      description: form.description || null,
      event_date: form.event_date,
      location: form.location || null,
      max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
      status: form.status,
      image_url: imageUrl,
    };

    let error;
    if (editando) {
      ({ error } = await supabase
        .from("events")
        .update(payload as any)
        .eq("id", editando.id));
    } else {
      ({ error } = await supabase.from("events").insert(payload as any));
    }

    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar evento: " + error.message);
      return;
    }

    toast.success(editando ? "Evento atualizado!" : "Evento criado!");
    setOpen(false);
    loadEventos();
  };

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Deseja excluir o evento "${titulo}"?`)) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir evento.");
      return;
    }
    toast.success("Evento excluído!");
    loadEventos();
  };

  const handleStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("events")
      .update({ status } as any)
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar.");
      return;
    }
    toast.success("Status atualizado!");
    loadEventos();
  };

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eventos"
        description="Gerencie os eventos da associação."
        action={
          <Button
            onClick={openCriar}
            className="bg-success text-success-foreground hover:bg-success/90 shadow-soft-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Evento
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
              {editando ? "Editar Evento" : "Criar Evento"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Upload de imagem */}
            <div>
              <Label>Imagem do Evento</Label>
              <div className="mt-1">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        set("image_url", "");
                      }}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/60 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Clique para selecionar uma imagem
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PNG, JPG até 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Nome do evento"
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Descreva o evento..."
              />
            </div>

            <div>
              <Label>Data e Hora *</Label>
              <Input
                type="datetime-local"
                value={form.event_date}
                onChange={(e) => set("event_date", e.target.value)}
              />
            </div>

            <div>
              <Label>Local</Label>
              <Input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Ex: Salão de festas"
              />
            </div>

            <div>
              <Label>Máx. participantes</Label>
              <Input
                type="number"
                value={form.max_attendees}
                onChange={(e) => set("max_attendees", e.target.value)}
                placeholder="Ex: 100"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em breve">Em breve</SelectItem>
                  <SelectItem value="encerrado">Encerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvar} disabled={saving || uploading}>
                {uploading
                  ? "Enviando imagem..."
                  : saving
                    ? "Salvando..."
                    : editando
                      ? "Salvar alterações"
                      : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de eventos */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Carregando...
        </p>
      ) : eventos.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum evento cadastrado"
          description="Crie o primeiro evento da associação."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {eventos.map((e) => (
            <Card
              key={e.id}
              className="overflow-hidden border-border shadow-soft-sm transition-all hover:-translate-y-0.5 hover:shadow-soft-md"
            >
              {/* Imagem */}
              <div className="aspect-video bg-muted flex items-center justify-center">
                {e.image_url ? (
                  <img
                    src={e.image_url}
                    alt={e.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-foreground truncate">
                      {e.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(e.event_date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                      {e.location && ` · ${e.location}`}
                    </p>
                    {e.description && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {e.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0 -mt-1 -mr-2"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditar(e)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatus(e.id, "aberto")}
                      >
                        Marcar como Aberto
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatus(e.id, "em breve")}
                      >
                        Marcar como Em breve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatus(e.id, "encerrado")}
                      >
                        Marcar como Encerrado
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(e.id, e.title)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3">
                  <StatusBadge status={e.status} />
                  {e.max_attendees && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {e.max_attendees} vagas
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
