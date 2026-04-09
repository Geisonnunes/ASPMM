import { motion } from "framer-motion";
import { CalendarDays, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-club.jpg";

const HeroSection = () => (
  <section className="relative min-h-[70vh] flex items-center overflow-hidden">
    <img
      src={heroImage}
      alt="Vista aérea do clube ASPMM"
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
          Associação dos Servidores Públicos
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading leading-tight text-background mb-4">
          Bem-vindo à <span className="text-accent">ASPMM</span>
        </h1>
        <p className="text-lg text-background/80 mb-8 font-body leading-relaxed">
          Esporte, lazer e convivência para servidores públicos e suas famílias em Marília. 
          Venha conhecer nossa estrutura completa!
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="gradient-hero text-primary-foreground border-0 shadow-elevated font-heading font-semibold">
            <Link to="/estrutura">
              <Building2 className="mr-2 h-5 w-5" />
              Conheça o Clube
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-background/10 text-background border-background/30 hover:bg-background/20 font-heading font-semibold">
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

export default HeroSection;
