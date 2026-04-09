import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FacilityCard from "@/components/FacilityCard";

import campoSociety from "@/assets/campo-society.jpg";
import campoOficial from "@/assets/campo-oficial.jpg";
import piscina from "@/assets/piscina.jpg";
import quadraAreia from "@/assets/quadra-areia.jpg";
import salaoFestas from "@/assets/salao-festas.jpg";
import areaLazer from "@/assets/area-lazer.jpg";

const facilities = [
  { name: "Campo Society 1", description: "Campo de grama sintética com iluminação noturna. Ideal para partidas de futebol society entre associados.", capacity: 14, rating: 4.8, image: campoSociety },
  { name: "Campo Society 2", description: "Segundo campo society com cobertura parcial e arquibancada lateral.", capacity: 14, rating: 4.7, image: campoSociety },
  { name: "Campo Oficial", description: "Campo de futebol tamanho oficial com grama natural. Usado para torneios e campeonatos.", capacity: 22, rating: 4.9, image: campoOficial },
  { name: "Piscina", description: "Piscina semiolímpica com tratamento de água de alta qualidade, espreguiçadeiras e quiosque.", capacity: 80, rating: 4.9, image: piscina },
  { name: "Quadra de Areia", description: "Quadra oficial para vôlei de praia e futevôlei. Areia de alta qualidade e rede profissional.", capacity: 20, rating: 4.7, image: quadraAreia },
  { name: "Salão de Festas", description: "Espaço climatizado com capacidade para 200 pessoas. Cozinha industrial e sistema de som.", capacity: 200, rating: 4.6, image: salaoFestas },
  { name: "Área de Lazer", description: "Churrasqueiras, quiosques e espaço para piquenique em meio à natureza.", capacity: 60, rating: 4.5, image: areaLazer },
];

const Estrutura = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <section className="gradient-hero py-16">
      <div className="container text-center">
        <h1 className="text-4xl font-extrabold font-heading text-primary-foreground mb-2">Estrutura do Clube</h1>
        <p className="text-primary-foreground/70 max-w-xl mx-auto">
          Conheça todos os espaços disponíveis para nossos associados e suas famílias.
        </p>
      </div>
    </section>
    <section className="py-16">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((f, i) => (
            <motion.div key={f.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <FacilityCard {...f} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Estrutura;
