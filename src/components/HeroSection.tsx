import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type SiteSettingsRow =
  Database["public"]["Tables"]["site_settings"]["Row"];

const HERO_DEFAULTS = {
  hero_badge: "Associação dos Servidores Públicos",
  hero_title: "Bem-vindo à",
  hero_title_accent: "ASPMM",
  hero_subtitle:
    "Esporte, lazer e convivência para servidores públicos e suas famílias em Marília. Venha conhecer nossa estrutura completa!",
};

interface HeroSectionProps {
  settings?: SiteSettingsRow | null;
}

const HeroSection = ({ settings }: HeroSectionProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const badge = settings?.hero_badge?.trim() || HERO_DEFAULTS.hero_badge;
  const title = settings?.hero_title?.trim() || HERO_DEFAULTS.hero_title;
  const titleAccent =
    settings?.hero_title_accent?.trim() || HERO_DEFAULTS.hero_title_accent;
  const subtitle =
    settings?.hero_subtitle?.trim() || HERO_DEFAULTS.hero_subtitle;

  useEffect(() => {
    const loadImages = async () => {
      setLoadingImages(true);
      const { data } = await supabase
        .from("hero_images")
        .select("url")
        .eq("is_active", true)
        .order("order_index");

      if (data && data.length > 0) {
        setImages(data.map((d) => d.url));
      }
      setLoadingImages(false);
    };
    loadImages();
  }, []); // carrega só uma vez ao montar

  const goNext = useCallback(() => {
    if (images.length <= 1) return;
    setFading(true);
    setTimeout(() => {
      setCurrent((c) => (c + 1) % images.length);
      setFading(false);
    }, 500);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [images.length, goNext]);

  const imgSrc = images[current] ?? "";

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Imagem de fundo com fade */}
      {!loadingImages && imgSrc && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
        >
          <img
            src={imgSrc}
            alt="Vista do clube ASPMM"
            className="w-full h-full object-cover"
            width={1920}
            height={800}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />

      {/* Conteúdo */}
      <div className="container relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider rounded-full bg-secondary text-secondary-foreground">
            {badge}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading leading-tight text-background mb-4">
            {title} <span className="text-accent">{titleAccent}</span>
          </h1>
          <p className="text-lg text-background/80 mb-8 font-body leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="gradient-hero text-primary-foreground border-0 shadow-elevated font-heading font-semibold"
            >
              <Link to="/estrutura">
                <Building2 className="mr-2 h-5 w-5" />
                Conheça o Clube
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-background/10 text-background border-background/30 hover:bg-background/20 font-heading font-semibold"
            >
              <Link to="/eventos">
                <CalendarDays className="mr-2 h-5 w-5" />
                Ver Eventos
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Indicadores do carrossel */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFading(true);
                setTimeout(() => {
                  setCurrent(i);
                  setFading(false);
                }, 500);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
