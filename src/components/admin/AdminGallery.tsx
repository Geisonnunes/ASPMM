import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Camera, Trash2, Plus, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Album {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
}

interface PhotoRow {
  id: string;
  url: string;
  caption: string | null;
}

function storagePathFromPublicUrl(publicUrl: string): string | null {
  const marker = "/object/public/photos/";
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(publicUrl.slice(i + marker.length));
}

const AdminGallery = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAlbums = async () => {
    const { data } = await supabase
      .from("photo_albums")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAlbums(data as Album[]);
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const loadPhotos = async (albumId: string) => {
    setSelectedId(albumId);
    const { data } = await supabase
      .from("photos")
      .select("id, url, caption")
      .eq("album_id", albumId)
      .order("created_at", { ascending: false });
    if (data) setPhotos(data as PhotoRow[]);
  };

  const createAlbum = async () => {
    if (!newTitle.trim()) {
      toast.error("Título obrigatório");
      return;
    }
    const { error } = await supabase.from("photo_albums").insert({
      title: newTitle.trim(),
      description: newDesc.trim() || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Álbum criado");
      setAlbumOpen(false);
      setNewTitle("");
      setNewDesc("");
      fetchAlbums();
    }
  };

  const deleteAlbum = async (id: string) => {
    const { error } = await supabase.from("photo_albums").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Álbum removido");
      if (selectedId === id) {
        setSelectedId(null);
        setPhotos([]);
      }
      fetchAlbums();
    }
  };

  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;
    if (!user) {
      toast.error("Inicie sessão para enviar fotos.");
      e.target.value = "";
      return;
    }
    const safeName = file.name.replace(/[^\w.-]/g, "_");
    const path = `${selectedId}/${crypto.randomUUID()}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("photos")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (upErr) {
      toast.error(upErr.message);
      e.target.value = "";
      return;
    }
    const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
    const { error } = await supabase.from("photos").insert({
      album_id: selectedId,
      url: pub.publicUrl,
      uploaded_by: user.id,
    });
    if (error) toast.error(error.message);
    else {
      const album = albums.find((a) => a.id === selectedId);
      if (album && !album.cover_url) {
        await supabase
          .from("photo_albums")
          .update({ cover_url: pub.publicUrl })
          .eq("id", selectedId);
        await fetchAlbums();
      }
      toast.success("Foto enviada");
      await loadPhotos(selectedId);
    }
    e.target.value = "";
  };

  const deletePhoto = async (photo: PhotoRow) => {
    const path = storagePathFromPublicUrl(photo.url);
    if (path) await supabase.storage.from("photos").remove([path]);
    const { error } = await supabase.from("photos").delete().eq("id", photo.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Foto removida");
      if (selectedId) await loadPhotos(selectedId);
    }
  };

  const selectedAlbum = albums.find((a) => a.id === selectedId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold font-heading">Galeria</h3>
        <Dialog open={albumOpen} onOpenChange={setAlbumOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gradient-hero text-primary-foreground border-0 w-fit"
            >
              <Plus className="mr-1 h-4 w-4" />
              Novo álbum
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Criar álbum</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Título"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <Button
                onClick={createAlbum}
                className="w-full gradient-hero text-primary-foreground border-0"
              >
                Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {albums.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-full">
            Nenhum álbum. Crie um para começar a enviar fotos.
          </p>
        )}
        {albums.map((album) => (
          <Card key={album.id} className="shadow-card overflow-hidden">
            <div className="relative h-36 bg-muted">
              {album.cover_url ? (
                <img
                  src={album.cover_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Camera className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <CardContent className="space-y-3 p-4">
              <p className="font-semibold font-heading">{album.title}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => loadPhotos(album.id)}
                >
                  Gerir fotos
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => deleteAlbum(album.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedId && selectedAlbum && (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Álbum selecionado</p>
              <p className="font-heading text-lg font-semibold">
                {selectedAlbum.title}
              </p>
            </div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickFile}
              />
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus className="mr-1 h-4 w-4" />
                Enviar foto
              </Button>
            </div>
          </div>
          {photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem fotos neste álbum.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                >
                  <img
                    src={p.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute right-1 top-1 h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => deletePhoto(p)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
