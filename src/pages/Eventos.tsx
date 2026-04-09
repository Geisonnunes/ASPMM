import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";

import campoSociety from "@/assets/campo-society.jpg";
import piscina from "@/assets/piscina.jpg";
import quadraAreia from "@/assets/quadra-areia.jpg";
import salaoFestas from "@/assets/salao-festas.jpg";
import campoOficial from "@/assets/campo-oficial.jpg";
import areaLazer from "@/assets/area-lazer.jpg";

const allEvents = [
  { title: "Torneio de Futebol Society", date: "20/04/2026", location: "Campo Society 1", description: "Torneio entre equipes de associados com premiação.", attendees: 48, image: campoSociety, status: "aberto" as const },
  { title: "Aula de Vôlei de Praia", date: "12/04/2026", location: "Quadra de Areia", description: "Aula gratuita para associados e dependentes de todos os níveis.", attendees: 24, image: quadraAreia, status: "aberto" as const },
  { title: "Festa Junina ASPMM", date: "13/06/2026", location: "Salão de Festas", description: "Comidas típicas, quadrilha, fogueira e muita diversão para toda família!", attendees: 120, image: salaoFestas, status: "em breve" as const },
  { title: "Campeonato de Natação", date: "10/05/2026", location: "Piscina", description: "Competição amistosa de natação para todas as idades.", attendees: 35, image: piscina, status: "em breve" as const },
  { title: "Churrasco dos Associados", date: "25/04/2026", location: "Área de Lazer", description: "Confraternização mensal com churrasco e música ao vivo.", attendees: 60, image: areaLazer, status: "aberto" as const },
  { title: "Torneio de Futebol Oficial", date: "01/03/2026", location: "Campo Oficial", description: "Campeonato entre clubes da região.", attendees: 80, image: campoOficial, status: "encerrado" as const },
];

type Filter = "todos" | "aberto" | "em breve" | "encerrado";
const filters: { label: string; value: Filter }[] = [
  { label: "Todos", value: "todos" },
  { label: "Abertos", value: "aberto" },
  { label: "Em Breve", value: "em breve" },
  { label: "Encerrados", value: "encerrado" },
];

const Eventos = () => {
  const [filter, setFilter] = useState<Filter>("todos");
  const filtered = filter === "todos" ? allEvents : allEvents.filter((e) => e.status === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="gradient-hero py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold font-heading text-primary-foreground mb-2">Eventos</h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            Fique por dentro de tudo que acontece no clube.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="container">
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((e, i) => (
              <motion.div key={e.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <EventCard {...e} />
              </motion.div>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Nenhum evento encontrado para este filtro.</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Eventos;
