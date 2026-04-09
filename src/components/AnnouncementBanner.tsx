import { Bell } from "lucide-react";

interface Announcement {
  id: number;
  text: string;
  date: string;
}

const announcements: Announcement[] = [
  { id: 1, text: "Manutenção da piscina dia 15/04 — piscina fechada no período da manhã.", date: "06/04/2026" },
  { id: 2, text: "Inscrições abertas para o Torneio de Futebol Society 2026!", date: "05/04/2026" },
];

const AnnouncementBanner = () => (
  <section className="bg-primary/5 border-y border-primary/10">
    <div className="container py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold font-heading text-foreground">Avisos Importantes</h3>
          {announcements.map((a) => (
            <p key={a.id} className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{a.date}:</span> {a.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AnnouncementBanner;
