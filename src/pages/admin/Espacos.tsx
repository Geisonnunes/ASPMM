import { useEffect, useState } from "react";
import {
  Plus,
  MapPin,
  MoreVertical,
  Trash2,
  Upload,
  X,
  Pencil,
} from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Espacos() {
  const [espacos, setEspacos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Criar
  const [openCriar, setOpenCriar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [rules, setRules] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Editar
  const [openEditar, setOpenEditar] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editRules, setEditRules] = useState("");
  const [editReservaAtiva, setEditReservaAtiva] = useState(true);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  useEffect(() => {
    loadEspacos();
  }, []);

  const loadEspacos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("facilities")
      .select("*, facility_images(id, url, order_index).order(order_index)")
      .order("created_at", { ascending: false });
    setEspacos(data ?? []);
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCapacity("");
    setRules("");
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      toast.error("Cada imagem deve ter no máximo 5MB.");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      toast.error("Cada imagem deve ter no máximo 5MB.");
      return;
    }
    setEditImageFiles((prev) => [...prev, ...files]);
    setEditImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const removeEditImage = (index: number) => {
    setEditImageFiles((prev) => prev.filter((_, i) => i !== index));
    setEditImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImagens = async (
    facilityId: string,
    files: File[],
    startIndex: number = 0,
  ) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `espacos/${facilityId}/${Date.now()}_${i}.${ext}`;
      const { error } = await supabase.storage
        .from("photos")
        .upload(path, file, { upsert: true });
      if (error) {
        toast.error(`Erro ao enviar imagem ${i + 1}: ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from("photos").getPublicUrl(path);
      await supabase.from("facility_images").insert({
        facility_id: facilityId,
        url: data.publicUrl,
        order_index: startIndex + i,
      } as any);
    }
  };

  const handleCriar = async () => {
    if (!name) {
      toast.error("O nome do espaço é obrigatório.");
      return;
    }
    if (imageFiles.length < 1) {
      toast.error("Adicione pelo menos 1 imagem.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("facilities")
      .insert({
        name,
        description: description || null,
        capacity: capacity ? parseInt(capacity) : 0,
        rules: rules || null,
      } as any)
      .select()
      .single();
    if (error || !data) {
      toast.error("Erro ao criar espaço: " + error?.message);
      setSaving(false);
      return;
    }
    setUploading(true);
    await uploadImagens(data.id, imageFiles);
    setUploading(false);
    toast.success("Espaço criado com sucesso!");
    setSaving(false);
    setOpenCriar(false);
    resetForm();
    loadEspacos();
  };

  const handleAbrirEditar = (e: any) => {
    setEditando(e);
    setEditName(e.name ?? "");
    setEditDescription(e.description ?? "");
    setEditCapacity(e.capacity ? String(e.capacity) : "");
    setEditRules(e.rules ?? "");
    setEditReservaAtiva(e.reserva_ativa !== false);
    setEditImageFiles([]);
    setEditImagePreviews([]);
    setOpenEditar(true);
  };

  const handleSalvarEditar = async () => {
    if (!editName) {
      toast.error("O nome do espaço é obrigatório.");
      return;
    }
    setSavingEdit(true);
    const { error } = await supabase
      .from("facilities")
      .update({
        name: editName,
        description: editDescription || null,
        capacity: editCapacity ? parseInt(editCapacity) : 0,
        rules: editRules || null,
        reserva_ativa: editReservaAtiva,
      } as any)
      .eq("id", editando.id);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      setSavingEdit(false);
      return;
    }
    if (editImageFiles.length > 0) {
      setUploadingEdit(true);
      const existingCount = (editando.facility_images ?? []).length;
      await uploadImagens(editando.id, editImageFiles, existingCount);
      setUploadingEdit(false);
    }
    toast.success("Espaço atualizado!");
    setSavingEdit(false);
    setOpenEditar(false);
    setEditando(null);
    loadEspacos();
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja excluir o espaço "${nome}"?`)) return;
    const { error } = await supabase.from("facilities").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir espaço.");
      return;
    }
    toast.success("Espaço excluído!");
    loadEspacos();
  };

  const handleDeleteImage = async (imageId: string) => {
    const { error } = await supabase
      .from("facility_images")
      .delete()
      .eq("id", imageId);
    if (error) {
      toast.error("Erro ao remover imagem.");
      return;
    }
    toast.success("Imagem removida!");
    setEspacos((prev) =>
      prev.map((e) => ({
        ...e,
        facility_images: (e.facility_images ?? []).filter(
          (img: any) => img.id !== imageId,
        ),
      })),
    );
    if (editando) {
      setEditando((prev: any) => ({
        ...prev,
        facility_images: (prev.facility_images ?? []).filter(
          (img: any) => img.id !== imageId,
        ),
      }));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Espaços"
        description="Gerencie os espaços disponíveis para reserva."
        action={
          <Dialog
            open={openCriar}
            onOpenChange={(v) => {
              setOpenCriar(v);
              if (!v) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-success text-success-foreground hover:bg-success/90 shadow-soft-sm">
                <Plus className="mr-2 h-4 w-4" /> Novo Espaço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">
                  Cadastrar Espaço
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>
                    Imagens do Espaço{" "}
                    <span className="text-muted-foreground font-normal">
                      (mín. 1)
                    </span>
                  </Label>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative">
                          <img
                            src={src}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-border"
                          />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:opacity-90"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white rounded px-1">
                              capa
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/60 transition-colors mt-2">
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-sm text-muted-foreground">
                      {imageFiles.length === 0
                        ? "Adicionar imagens"
                        : `Adicionar mais (${imageFiles.length})`}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Churrasqueira 01"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o espaço..."
                  />
                </div>
                <div>
                  <Label>Capacidade (pessoas)</Label>
                  <Input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Ex: 50"
                  />
                </div>
                <div>
                  <Label>Regras de uso</Label>
                  <Textarea
                    rows={3}
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    placeholder="Regras do espaço..."
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenCriar(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCriar} disabled={saving || uploading}>
                    {uploading
                      ? "Enviando imagens..."
                      : saving
                        ? "Criando..."
                        : "Criar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Dialog Editar */}
      <Dialog
        open={openEditar}
        onOpenChange={(v) => {
          setOpenEditar(v);
          if (!v) {
            setEditando(null);
            setEditImageFiles([]);
            setEditImagePreviews([]);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Espaço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {editando && (editando.facility_images ?? []).length > 0 && (
              <div>
                <Label>Imagens atuais</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Passe o mouse para remover uma imagem.
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[...(editando.facility_images ?? [])]
                    .sort((a: any, b: any) => a.order_index - b.order_index)
                    .map((img: any, i: number) => (
                      <div
                        key={img.id}
                        className="relative group cursor-pointer"
                      >
                        <img
                          src={img.url}
                          alt={`Foto ${i + 1}`}
                          className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${i === 0 ? "border-primary" : "border-border"}`}
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="bg-destructive text-destructive-foreground rounded p-1 hover:opacity-90"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground rounded px-1">
                            capa
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div>
              <Label>Adicionar novas imagens</Label>
              {editImagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {editImagePreviews.map((src, i) => (
                    <div key={i} className="relative">
                      <img
                        src={src}
                        alt={`Nova ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                      <button
                        onClick={() => removeEditImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:opacity-90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/60 transition-colors mt-2">
                <Upload className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">
                  {editImageFiles.length === 0
                    ? "Adicionar imagens"
                    : `${editImageFiles.length} nova(s)`}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleEditImageChange}
                />
              </label>
            </div>

            <div>
              <Label>Nome *</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Capacidade (pessoas)</Label>
              <Input
                type="number"
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
              />
            </div>
            <div>
              <Label>Regras de uso</Label>
              <Textarea
                rows={3}
                value={editRules}
                onChange={(e) => setEditRules(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between py-3 px-1 border-t border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Permitir reservas
                </p>
                <p className="text-xs text-muted-foreground">
                  Exibe o botão de solicitar reserva no site
                </p>
              </div>
              <Switch
                checked={editReservaAtiva}
                onCheckedChange={setEditReservaAtiva}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpenEditar(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSalvarEditar}
                disabled={savingEdit || uploadingEdit}
              >
                {uploadingEdit
                  ? "Enviando imagens..."
                  : savingEdit
                    ? "Salvando..."
                    : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Carregando...
        </p>
      ) : espacos.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Nenhum espaço cadastrado"
          description="Cadastre os espaços disponíveis para reserva."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {espacos.map((e) => {
            const imagens = [...(e.facility_images ?? [])].sort(
              (a: any, b: any) => a.order_index - b.order_index,
            );
            return (
              <Card
                key={`${e.id}-${imagens.length}`}
                className="overflow-hidden border-border shadow-soft-sm transition-all hover:-translate-y-0.5 hover:shadow-soft-md"
              >
                <div className="aspect-video bg-muted flex items-center justify-center relative group">
                  {imagens[0] ? (
                    <>
                      <img
                        src={imagens[0].url}
                        alt={e.name}
                        className="w-full h-full object-cover"
                      />
                      {imagens.length > 1 && (
                        <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white rounded px-2 py-0.5">
                          {imagens.length - 1} foto
                          {imagens.length - 1 !== 1 ? "s" : ""}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteImage(imagens[0].id)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity"
                      >
                        <Trash2 className="h-6 w-6 text-white" />
                        <span className="text-xs text-white font-medium">
                          Remover imagem
                        </span>
                      </button>
                    </>
                  ) : (
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground truncate">
                        {e.name}
                      </p>
                      {e.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
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
                        <DropdownMenuItem onClick={() => handleAbrirEditar(e)}>
                          <Pencil className="mr-2 h-3.5 w-3.5" /> Editar espaço
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(e.id, e.name)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir espaço
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {e.capacity > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-info/30 bg-info-soft text-info"
                      >
                        {e.capacity} pessoas
                      </Badge>
                    )}
                  </div>

                  {imagens.length > 1 && (
                    <div className="mt-3 flex gap-1 flex-wrap">
                      {imagens.slice(1).map((img: any) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.url}
                            alt=""
                            className="h-10 w-10 object-cover rounded border border-border"
                          />
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute inset-0 bg-black/50 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
