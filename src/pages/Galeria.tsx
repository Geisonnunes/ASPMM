import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

interface Album {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

const Galeria = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    const { data } = await supabase.from("photo_albums").select("*").order("created_at", { ascending: false });
    if (data) setAlbums(data);
  };

  const openAlbum = async (album: Album) => {
    setSelectedAlbum(album);
    const { data } = await supabase.from("photos").select("id, url, caption").eq("album_id", album.id);
    if (data) setPhotos(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="gradient-hero py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold font-heading text-primary-foreground mb-2">Galeria de Fotos</h1>
          <p className="text-primary-foreground/70">Momentos especiais do clube</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          {!selectedAlbum ? (
            <>
              {albums.length === 0 ? (
                <div className="text-center py-20">
                  <Camera className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Nenhum álbum disponível ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albums.map((album, i) => (
                    <motion.div key={album.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                      <Card className="overflow-hidden shadow-card hover:shadow-elevated transition-shadow cursor-pointer group" onClick={() => openAlbum(album)}>
                        <div className="relative h-52 overflow-hidden bg-muted">
                          {album.cover_url ? (
                            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Camera className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                          <h3 className="absolute bottom-3 left-4 text-lg font-bold font-heading text-background">{album.title}</h3>
                        </div>
                        {album.description && (
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground line-clamp-2">{album.description}</p>
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <button onClick={() => { setSelectedAlbum(null); setPhotos([]); }} className="text-primary font-medium text-sm mb-6 hover:underline">
                ← Voltar aos álbuns
              </button>
              <h2 className="text-2xl font-bold font-heading text-foreground mb-2">{selectedAlbum.title}</h2>
              {selectedAlbum.description && <p className="text-muted-foreground mb-6">{selectedAlbum.description}</p>}

              {photos.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">Nenhuma foto neste álbum.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group" onClick={() => setLightbox(photo.url)}>
                      <img src={photo.url} alt={photo.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-background" onClick={() => setLightbox(null)}>
            <X className="h-8 w-8" />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Galeria;
