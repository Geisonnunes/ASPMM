import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle, MapPin, Globe, Handshake } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
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
  saude: "border-success/30 bg-success-soft text-success",
  estetica: "border-info/30 bg-info-soft text-info",
  veiculos: "border-warning/30 bg-warning-soft text-warning",
  alimentacao: "border-orange-200 bg-orange-50 text-orange-600",
  educacao: "border-purple-200 bg-purple-50 text-purple-600",
  outros: "border-border bg-muted text-muted-foreground",
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

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

      <section className="py-16">
        <div className="container">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-8">
            {ALL_CATEGORIES.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={filter === cat ? "default" : "outline"}
                onClick={() => setFilter(cat)}
              >
                {cat === "todos" ? "Todos" : CATEGORIES[cat]}
              </Button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full shadow-card hover:shadow-elevated transition-all group">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {c.logo_url ? (
                          <img
                            src={c.logo_url}
                            alt={c.name}
                            className="h-16 w-16 rounded-xl object-contain border border-border bg-muted/30 shrink-0 p-1"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Handshake className="h-8 w-8 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-heading font-bold text-foreground text-lg leading-tight">
                            {c.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-xs mt-1 ${CATEGORY_COLORS[c.category]}`}
                          >
                            {CATEGORIES[c.category]}
                          </Badge>
                        </div>
                      </div>

                      {/* Descrição */}
                      {c.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                          {c.description}
                        </p>
                      )}

                      {/* Informações de contato */}
                      <div className="space-y-2 mt-auto">
                        {c.phone && (
                          <a
                            href={`tel:${c.phone}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Phone className="h-4 w-4 shrink-0 text-primary" />
                            {c.phone}
                          </a>
                        )}
                        {c.whatsapp && (
                          <a
                            href={`https://wa.me/55${c.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <MessageCircle className="h-4 w-4 shrink-0 text-green-500" />
                            {c.whatsapp}
                          </a>
                        )}
                        {c.address && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                            {c.address}
                          </div>
                        )}
                        {c.website && (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Globe className="h-4 w-4 shrink-0 text-primary" />
                            Visitar site
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
