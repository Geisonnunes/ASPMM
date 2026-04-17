import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { skipAdminGuard } from "@/lib/devFlags";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  removePhotosObjectByUrl,
  uploadToPhotosBucket,
} from "@/lib/storageUpload";

type SiteSettingsUpdate =
  Database["public"]["Tables"]["site_settings"]["Update"];

const AdminContent = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editorTitle, setEditorTitle] = useState("");
  const [editorDescription, setEditorDescription] = useState("");
  const [heroBadge, setHeroBadge] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroTitleAccent, setHeroTitleAccent] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [previousHeroImageUrl, setPreviousHeroImageUrl] = useState<
    string | null
  >(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (skipAdminGuard) return;
    if (!authLoading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      if (data) {
        setEditorTitle(data.editor_title ?? "");
        setEditorDescription(data.editor_description ?? "");
        setHeroBadge(data.hero_badge ?? "");
        setHeroTitle(data.hero_title ?? "");
        setHeroTitleAccent(data.hero_title_accent ?? "");
        setHeroSubtitle(data.hero_subtitle ?? "");
        setHeroImageUrl(data.hero_image_url ?? "");
        setPreviousHeroImageUrl(data.hero_image_url ?? null);
      }
      setLoading(false);
    })();
  }, []);

  if (authLoading && !skipAdminGuard)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  if (!skipAdminGuard && !isAdmin) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let nextHeroImage = heroImageUrl.trim() || null;
    if (heroImageFile) {
      const up = await uploadToPhotosBucket(heroImageFile, "site/hero");
      if ("error" in up) {
        setSaving(false);
        toast.error(up.error);
        return;
      }
      nextHeroImage = up.publicUrl;
      if (previousHeroImageUrl && previousHeroImageUrl !== nextHeroImage) {
        await removePhotosObjectByUrl(previousHeroImageUrl);
      }
    }
    const payload: SiteSettingsUpdate = {
      editor_title: editorTitle,
      editor_description: editorDescription,
      hero_badge: heroBadge,
      hero_title: heroTitle,
      hero_title_accent: heroTitleAccent,
      hero_subtitle: heroSubtitle,
      hero_image_url: nextHeroImage,
    };
    const { error } = await supabase
      .from("site_settings")
      .update(payload)
      .eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      setPreviousHeroImageUrl(nextHeroImage);
      setHeroImageFile(null);
      if (heroFileRef.current) heroFileRef.current.value = "";
      toast.success("Conteúdo guardado.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="gradient-hero py-10">
        <div className="container">
          <h1 className="text-3xl font-extrabold font-heading text-primary-foreground flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Conteúdo do site
          </h1>
          <p className="text-primary-foreground/80 mt-2 max-w-2xl">
            Textos do hero e bloco opcional na página inicial. Corre a migração
            Supabase se a tabela{" "}
            <code className="text-xs bg-primary-foreground/10 px-1 rounded">
              site_settings
            </code>{" "}
            ainda não existir.
          </p>
        </div>
      </section>
      <section className="py-8 flex-1">
        <div className="container max-w-2xl space-y-6">
          {loading ? (
            <p className="text-muted-foreground">A carregar…</p>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-heading">
                    Bloco na página inicial
                  </CardTitle>
                  <CardDescription>
                    Aparece abaixo do hero quando o título ou a descrição não
                    estão vazios.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content-title">Título</Label>
                    <Input
                      id="content-title"
                      placeholder="Título da seção"
                      value={editorTitle}
                      onChange={(e) => setEditorTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content-description">Descrição</Label>
                    <Textarea
                      id="content-description"
                      placeholder="Texto descritivo…"
                      rows={5}
                      value={editorDescription}
                      onChange={(e) => setEditorDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-heading">Hero (dobra principal)</CardTitle>
                  <CardDescription>
                    Imagem de fundo (URL ou ficheiro) e textos da primeira dobra.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-image">URL da imagem de fundo</Label>
                    <Input
                      id="hero-image"
                      placeholder="https://… (ignorada se enviar ficheiro)"
                      value={heroImageUrl}
                      onChange={(e) => setHeroImageUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-image-file">Ou enviar imagem do hero</Label>
                    <Input
                      ref={heroFileRef}
                      id="hero-image-file"
                      type="file"
                      accept="image/*"
                      className="cursor-pointer"
                      onChange={(e) =>
                        setHeroImageFile(e.target.files?.item(0) ?? null)
                      }
                    />
                    {heroImageFile && (
                      <p className="text-xs text-muted-foreground">
                        {heroImageFile.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-badge">Selo (linha pequena)</Label>
                    <Input
                      id="hero-badge"
                      value={heroBadge}
                      onChange={(e) => setHeroBadge(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-title">Título (antes do destaque)</Label>
                    <Input
                      id="hero-title"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-accent">Palavra em destaque</Label>
                    <Input
                      id="hero-accent"
                      value={heroTitleAccent}
                      onChange={(e) => setHeroTitleAccent(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-sub">Subtítulo</Label>
                    <Textarea
                      id="hero-sub"
                      rows={3}
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto gradient-hero text-primary-foreground border-0"
              >
                {saving ? "A guardar…" : "Guardar tudo"}
              </Button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminContent;
