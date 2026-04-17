import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  eventRowToCardProps,
  type EventRow,
} from "@/lib/eventDisplay";

type Filter = "todos" | "aberto" | "em breve" | "encerrado";
const filters: { label: string; value: Filter }[] = [
  { label: "Todos", value: "todos" },
  { label: "Abertos", value: "aberto" },
  { label: "Em Breve", value: "em breve" },
  { label: "Encerrados", value: "encerrado" },
];

const Eventos = () => {
  const [filter, setFilter] = useState<Filter>("todos");
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, description, event_date, location, max_attendees, status, image_url",
        )
        .order("event_date", { ascending: true });
      if (!error && data) setRows(data as EventRow[]);
      setLoading(false);
    })();
  }, []);

  const filteredRows =
    filter === "todos"
      ? rows
      : rows.filter((r) => {
          const { status } = eventRowToCardProps(r);
          return status === filter;
        });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="gradient-hero py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold font-heading text-primary-foreground mb-2">
            Eventos
          </h1>
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
          {loading ? (
            <p className="text-center text-muted-foreground py-12">
              A carregar eventos…
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRows.map((row, i) => (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <EventCard {...eventRowToCardProps(row)} />
                  </motion.div>
                ))}
              </div>
              {filteredRows.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                  Nenhum evento encontrado para este filtro.
                </p>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Eventos;
