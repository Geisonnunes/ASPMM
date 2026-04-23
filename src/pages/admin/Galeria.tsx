import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function Galeria() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("photo_albums")
        .select("*, photos(id, url)")
        .order("created_at", { ascending: false });
      setAlbums(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Galeria" description="Álbuns e fotos da associação." />
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Carregando...
        </p>
      ) : albums.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Nenhum álbum cadastrado"
          description="Os álbuns aparecem aqui quando criados."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((a) => (
            <Card
              key={a.id}
              className="overflow-hidden border-border shadow-soft-sm transition-all hover:-translate-y-0.5 hover:shadow-soft-md"
            >
              <div className="aspect-video bg-muted flex items-center justify-center">
                {a.photos?.[0]?.url ? (
                  <img
                    src={a.photos[0].url}
                    alt={a.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-4">
                <p className="font-display text-sm font-semibold text-foreground">
                  {a.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {a.photos?.length ?? 0} fotos
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
