import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FacilityCard from "@/components/FacilityCard";
import { supabase } from "@/integrations/supabase/client";
import { facilityRowToCardProps, type FacilityRow } from "@/lib/facilityDisplay";

const Estrutura = () => {
  const [rows, setRows] = useState<FacilityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("id, name, description, capacity, rating, image_url")
        .order("name", { ascending: true });
      if (!error && data) setRows(data as FacilityRow[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="gradient-hero py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold font-heading text-primary-foreground mb-2">
            Estrutura do Clube
          </h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            Conheça todos os espaços disponíveis para nossos associados e suas
            famílias.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="container">
          {loading ? (
            <p className="text-center text-muted-foreground py-12">
              A carregar espaços…
            </p>
          ) : rows.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Nenhum espaço registado ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rows.map((row, i) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <FacilityCard {...facilityRowToCardProps(row)} />
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

export default Estrutura;
