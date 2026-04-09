import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Shield, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import EventCard from "@/components/EventCard";
import FacilityCard from "@/components/FacilityCard";

import campoSociety from "@/assets/campo-society.jpg";
import piscina from "@/assets/piscina.jpg";
import quadraAreia from "@/assets/quadra-areia.jpg";
import salaoFestas from "@/assets/salao-festas.jpg";

const upcomingEvents = [
  {
    title: "Torneio de Futebol Society",
    date: "20/04/2026",
    location: "Campo Society 1",
    description: "Torneio entre equipes de associados. Inscrições abertas até 15/04.",
    attendees: 48,
    image: campoSociety,
    status: "aberto" as const,
  },
  {
    title: "Festa Junina ASPMM",
    date: "13/06/2026",
    location: "Salão de Festas",
    description: "Venha celebrar com comidas típicas, quadrilha e muita diversão!",
    attendees: 120,
    image: salaoFestas,
    status: "em breve" as const,
  },
  {
    title: "Aula de Vôlei de Praia",
    date: "12/04/2026",
    location: "Quadra de Areia",
    description: "Aula gratuita para associados e dependentes. Todos os níveis.",
    attendees: 24,
    image: quadraAreia,
    status: "aberto" as const,
  },
];

const featuredFacilities = [
  { name: "Campo Society", description: "Dois campos de grama sintética com iluminação noturna.", capacity: 14, rating: 4.8, image: campoSociety },
  { name: "Piscina", description: "Piscina semiolímpica com área de descanso e quiosque.", capacity: 80, rating: 4.9, image: piscina },
  { name: "Quadra de Areia", description: "Quadra oficial para vôlei e futevôlei.", capacity: 20, rating: 4.7, image: quadraAreia },
  { name: "Salão de Festas", description: "Espaço climatizado para eventos e confraternizações.", capacity: 200, rating: 4.6, image: salaoFestas },
];

const stats = [
  { icon: Shield, label: "Anos de história", value: "30+" },
  { icon: Trophy, label: "Eventos por ano", value: "50+" },
  { icon: CalendarDays, label: "Associados ativos", value: "800+" },
];

const Index = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <HeroSection />
    <AnnouncementBanner />

    {/* Stats */}
    <section className="py-12 gradient-hero">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-2"
            >
              <s.icon className="h-8 w-8 text-primary-foreground/80" />
              <span className="text-3xl font-extrabold font-heading text-primary-foreground">{s.value}</span>
              <span className="text-sm text-primary-foreground/70">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Facilities */}
    <section className="py-16">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold font-heading text-foreground">Nossa Estrutura</h2>
            <p className="text-muted-foreground mt-1">Conheça os espaços do clube</p>
          </div>
          <Button asChild variant="ghost" className="text-primary">
            <Link to="/estrutura">Ver todos <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredFacilities.map((f) => (
            <motion.div key={f.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <FacilityCard {...f} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Events */}
    <section className="py-16 bg-muted/50">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold font-heading text-foreground">Próximos Eventos</h2>
            <p className="text-muted-foreground mt-1">Participe das atividades do clube</p>
          </div>
          <Button asChild variant="ghost" className="text-primary">
            <Link to="/eventos">Ver todos <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((e) => (
            <motion.div key={e.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <EventCard {...e} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Index;
