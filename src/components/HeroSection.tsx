import { motion } from "framer-motion";
import { CalendarDays, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroFallback from "@/assets/hero-club.jpg";
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
  const badge = settings?.hero_badge?.trim() || HERO_DEFAULTS.hero_badge;
  const title = settings?.hero_title?.trim() || HERO_DEFAULTS.hero_title;
  const titleAccent =
    settings?.hero_title_accent?.trim() || HERO_DEFAULTS.hero_title_accent;
  const subtitle =
    settings?.hero_subtitle?.trim() || HERO_DEFAULTS.hero_subtitle;
  const imgSrc = settings?.hero_image_url?.trim() || heroFallback;

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      <img
        src={imgSrc}
        alt="Vista do clube ASPMM"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={800}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />

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
    </section>
  );
};

export default HeroSection;
