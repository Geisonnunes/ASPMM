import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function Galeria() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Estados do formulário de álbum
  const [openAlbum, setOpenAlbum] = useState(false);
  const [savingAlbum, setSavingAlbum] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");

  // Estados do upload de fotos
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("photo_albums")
      .select("*, photos(id, url)")
      .order("created_at", { ascending: false });
    setAlbums(data ?? []);
    setLoading(false);
  };

  const loadPhotos = async (albumId: string) => {
    setLoadingPhotos(true);
    const { data } = await supabase
      .from("photos")
      .select("id, url, caption")
      .eq("album_id", albumId)
      .order("created_at", { ascending: true });
    setPhotos(data ?? []);
    setLoadingPhotos(false);
  };

  const handleOpenAlbum = async (album: any) => {
    setSelectedAlbum(album);
    await loadPhotos(album.id);
  };

  const handleCriarAlbum = async () => {
    if (!albumTitle.trim()) {
      toast.error("O título do álbum é obrigatório.");
      return;
    }
    setSavingAlbum(true);

    const { error } = await supabase.from("photo_albums").insert({
      title: albumTitle.trim(),
      description: albumDescription.trim() || null,
    } as any);

    setSavingAlbum(false);
    if (error) {
      toast.error("Erro ao criar álbum: " + error.message);
      return;
    }

    toast.success("Álbum criado com sucesso!");
    setOpenAlbum(false);
    setAlbumTitle("");
    setAlbumDescription("");
    loadAlbums();
  };

  const handleDeleteAlbum = async (id: string, title: string) => {
    if (!confirm(`Deseja excluir o álbum "${title}" e todas as suas fotos?`))
      return;
    const { error } = await supabase.from("photo_albums").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir álbum.");
      return;
    }
    toast.success("Álbum excluído!");
    if (selectedAlbum?.id === id) setSelectedAlbum(null);
    loadAlbums();
  };

  const handleUploadFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !selectedAlbum) return;

    setUploadingPhotos(true);
    let sucessos = 0;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} excede 10MB, ignorado.`);
        continue;
      }

      const ext = file.name.split(".").pop();
      const path = `galeria/${selectedAlbum.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        toast.error(`Erro ao enviar ${file.name}.`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(path);

      // Primeira foto do álbum vira a capa
      const isCover = photos.length === 0 && sucessos === 0;

      const { error: dbError } = await supabase.from("photos").insert({
        album_id: selectedAlbum.id,
        url: urlData.publicUrl,
      } as any);

      if (!dbError && isCover) {
        await supabase
          .from("photo_albums")
          .update({ cover_url: urlData.publicUrl } as any)
          .eq("id", selectedAlbum.id);
      }

      if (!dbError) sucessos++;
    }

    setUploadingPhotos(false);
    e.target.value = "";

    if (sucessos > 0) {
      toast.success(
        `${sucessos} foto${sucessos > 1 ? "s" : ""} adicionada${sucessos > 1 ? "s" : ""}!`,
      );
      await loadPhotos(selectedAlbum.id);
      loadAlbums();
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    const { error } = await supabase.from("photos").delete().eq("id", photoId);
    if (error) {
      toast.error("Erro ao excluir foto.");
      return;
    }
    toast.success("Foto removida!");
    await loadPhotos(selectedAlbum.id);
    loadAlbums();
  };

  const handleSetCover = async (url: string) => {
    await supabase
      .from("photo_albums")
      .update({ cover_url: url } as any)
      .eq("id", selectedAlbum.id);
    toast.success("Capa atualizada!");
    loadAlbums();
  };

  // ─── TELA DE FOTOS DO ÁLBUM ───────────────────────────────────────────────
  if (selectedAlbum) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={selectedAlbum.title}
          description={
            selectedAlbum.description ??
            `${photos.length} foto${photos.length !== 1 ? "s" : ""}`
          }
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAlbum(null);
                  loadAlbums();
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <label
                className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-success text-success-foreground hover:bg-success/90 shadow-soft-sm transition-colors ${uploadingPhotos ? "opacity-60 pointer-events-none" : ""}`}
              >
                <Upload className="h-4 w-4" />
                {uploadingPhotos ? "Enviando..." : "Adicionar Fotos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleUploadFotos}
                  disabled={uploadingPhotos}
                />
              </label>
            </div>
          }
        />

        {loadingPhotos ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Carregando fotos...
          </p>
        ) : photos.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="Nenhuma foto neste álbum"
            description="Clique em 'Adicionar Fotos' para começar."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Ações ao hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleSetCover(photo.url)}
                    className="text-xs bg-white/90 text-foreground rounded px-2 py-1 font-medium hover:bg-white"
                  >
                    Definir capa
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="bg-destructive text-destructive-foreground rounded p-1.5 hover:opacity-90"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── TELA DE ÁLBUNS ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Galeria"
        description="Álbuns de fotos da associação."
        action={
          <Dialog open={openAlbum} onOpenChange={setOpenAlbum}>
            <DialogTrigger asChild>
              <Button className="bg-success text-success-foreground hover:bg-success/90 shadow-soft-sm">
                <Plus className="mr-2 h-4 w-4" /> Novo Álbum
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Criar Álbum</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="Ex: Campeonato Society 2026"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    rows={3}
                    value={albumDescription}
                    onChange={(e) => setAlbumDescription(e.target.value)}
                    placeholder="Descreva o álbum..."
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setOpenAlbum(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCriarAlbum} disabled={savingAlbum}>
                    {savingAlbum ? "Criando..." : "Criar"}
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
      ) : albums.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Nenhum álbum cadastrado"
          description="Crie o primeiro álbum da galeria."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((a) => (
            <Card
              key={a.id}
              className="overflow-hidden border-border shadow-soft-sm transition-all hover:-translate-y-0.5 hover:shadow-soft-md cursor-pointer"
              onClick={() => handleOpenAlbum(a)}
            >
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                {a.cover_url ? (
                  <img
                    src={a.cover_url}
                    alt={a.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-4 flex items-start justify-between">
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">
                    {a.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.photos?.length ?? 0} foto
                    {(a.photos?.length ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAlbum(a.id, a.title);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir álbum
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
