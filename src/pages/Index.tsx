import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Shield, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection, { type SiteSettingsRow } from "@/components/HeroSection";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import EventCard from "@/components/EventCard";
import FacilityCard from "@/components/FacilityCard";
import StaffCard from "@/components/StaffCard";
import { supabase } from "@/integrations/supabase/client";
import { eventRowToCardProps, type EventRow } from "@/lib/eventDisplay";

import {
  facilityRowToCardProps,
  type FacilityRow,
} from "@/lib/facilityDisplay";

const Index = () => {
  const [upcomingRows, setUpcomingRows] = useState<EventRow[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsRow | null>(
    null,
  );
  const [facilityRows, setFacilityRows] = useState<FacilityRow[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [staffRows, setStaffRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const now = new Date().toISOString();
      const [evRes, siteRes, facRes, staffRes] = await Promise.all([
        supabase
          .from("events")
          .select(
            "id, title, description, event_date, location, max_attendees, status, image_url",
          )
          .neq("status", "encerrado")
          .gte("event_date", now)
          .order("event_date", { ascending: true })
          .limit(3),
        supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        supabase
          .from("facilities")
          .select(
            "id, name, description, capacity, rating, image_url, reserva_ativa, facility_images(id, url, order_index).order(order_index)",
          )
          .order("name", { ascending: true }),
        supabase
          .from("staff")
          .select("*")
          .eq("is_active", true)
          .order("order_index")
          .limit(8),
      ]);
      if (!evRes.error && evRes.data) setUpcomingRows(evRes.data as EventRow[]);
      if (!siteRes.error && siteRes.data)
        setSiteSettings(siteRes.data as SiteSettingsRow);
      if (!facRes.error && facRes.data)
        setFacilityRows(facRes.data as FacilityRow[]);
      if (!staffRes.error && staffRes.data) setStaffRows(staffRes.data);
      setEventsLoading(false);
      setFacilitiesLoading(false);
    })();
  }, []);

  const showEditorBlock = Boolean(
    siteSettings &&
    (siteSettings.editor_title?.trim() ||
      siteSettings.editor_description?.trim()),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection settings={siteSettings} />
      {showEditorBlock && siteSettings && (
        <section className="border-b border-border bg-muted/50 py-10">
          <div className="container max-w-3xl text-center">
            {siteSettings.editor_title?.trim() && (
              <h2 className="text-2xl font-bold font-heading text-foreground">
                {siteSettings.editor_title.trim()}
              </h2>
            )}
            {siteSettings.editor_description?.trim() && (
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {siteSettings.editor_description.trim()}
              </p>
            )}
          </div>
        </section>
      )}
      <AnnouncementBanner />

      {/* Stats — dinâmicos do banco */}
      <section className="py-12 gradient-hero">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              {
                icon: Shield,
                value: siteSettings?.stat1_value ?? "30+",
                label: siteSettings?.stat1_label ?? "Anos de história",
              },
              {
                icon: Trophy,
                value: siteSettings?.stat2_value ?? "50+",
                label: siteSettings?.stat2_label ?? "Eventos por ano",
              },
              {
                icon: CalendarDays,
                value: siteSettings?.stat3_value ?? "800+",
                label: siteSettings?.stat3_label ?? "Associados ativos",
              },
            ].map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-2"
              >
                <s.icon className="h-8 w-8 text-primary-foreground/80" />
                <span className="text-3xl font-extrabold font-heading text-primary-foreground">
                  {s.value}
                </span>
                <span className="text-sm text-primary-foreground/70">
                  {s.label}
                </span>
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
              <h2 className="text-3xl font-bold font-heading text-foreground">
                Nossa Estrutura
              </h2>
              <p className="text-muted-foreground mt-1">
                Conheça os espaços do clube
              </p>
            </div>
            <Button asChild variant="ghost" className="text-primary">
              <Link to="/estrutura">
                Ver todos <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {facilitiesLoading ? (
            <p className="text-muted-foreground py-6">A carregar espaços…</p>
          ) : facilityRows.length === 0 ? (
            <p className="text-muted-foreground py-6">
              Ainda não há espaços registados na base.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {facilityRows.map((row) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <FacilityCard {...facilityRowToCardProps(row)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Events */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-heading text-foreground">
                Próximos Eventos
              </h2>
              <p className="text-muted-foreground mt-1">
                Participe das atividades do clube
              </p>
            </div>
            <Button asChild variant="ghost" className="text-primary">
              <Link to="/eventos">
                Ver todos <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {eventsLoading ? (
            <p className="text-muted-foreground text-center py-8">
              A carregar eventos…
            </p>
          ) : upcomingRows.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum evento futuro agendado. Consulte a página de eventos ou
              volte em breve.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingRows.map((row) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <EventCard {...eventRowToCardProps(row)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Equipe */}
      {staffRows.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-heading text-foreground">
                Nossa Equipe
              </h2>
              <p className="text-muted-foreground mt-1">
                Conheça os responsáveis pela associação
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center">
              {staffRows.map((s) => (
                <StaffCard key={s.id} {...s} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
