import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  Handshake,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES: Record<string, string> = {
  saude: "Saúde",
  estetica: "Estética",
  veiculos: "Veículos",
  alimentacao: "Alimentação",
  educacao: "Educação",
  outros: "Outros",
};

const CATEGORY_COLORS: Record<string, string> = {
  saude: "bg-emerald-100 text-emerald-700 border-emerald-200",
  estetica: "bg-sky-100 text-sky-700 border-sky-200",
  veiculos: "bg-amber-100 text-amber-700 border-amber-200",
  alimentacao: "bg-orange-100 text-orange-700 border-orange-200",
  educacao: "bg-purple-100 text-purple-700 border-purple-200",
  outros: "bg-gray-100 text-gray-600 border-gray-200",
};

const ALL_CATEGORIES = ["todos", ...Object.keys(CATEGORIES)];

const Convenios = () => {
  const [convenios, setConvenios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("partnerships")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      setConvenios(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered =
    filter === "todos"
      ? convenios
      : convenios.filter((c) => c.category === filter);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold font-heading text-primary-foreground mb-2">
            Convênios
          </h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            Parcerias e benefícios exclusivos para os associados da ASPMM.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  filter === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat === "todos" ? "Todos" : CATEGORIES[cat]}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-12">
              Carregando...
            </p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Handshake className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                Nenhum convênio encontrado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <div className="group relative flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 h-full">
                    {/* Imagem em destaque */}
                    <div className="relative h-72 overflow-hidden bg-white flex items-center justify-center">
                      {c.logo_url ? (
                        <img
                          src={c.logo_url}
                          alt={c.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <Handshake className="h-12 w-12 text-primary/40" />
                        </div>
                      )}

                      {/* Badge de categoria sobreposta */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm bg-white/80 ${CATEGORY_COLORS[c.category]}`}
                        >
                          {CATEGORIES[c.category]}
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex flex-col flex-1 p-4">
                      <h3 className="font-heading font-bold text-foreground text-base leading-tight mb-1">
                        {c.name}
                      </h3>

                      {c.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                          {c.description}
                        </p>
                      )}

                      {/* Contatos */}
                      {(c.phone || c.whatsapp || c.address || c.website) && (
                        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                          {c.phone && (
                            <a
                              href={`tel:${c.phone}`}
                              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                              {c.phone}
                            </a>
                          )}
                          {c.whatsapp && (
                            <a
                              href={`https://wa.me/55${c.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-green-600 transition-colors"
                            >
                              <MessageCircle className="h-3.5 w-3.5 shrink-0 text-green-500" />
                              {c.whatsapp}
                            </a>
                          )}
                          {c.address && (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                              {c.address}
                            </div>
                          )}
                          {c.website && (
                            <a
                              href={c.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              Visitar site
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Convenios;
