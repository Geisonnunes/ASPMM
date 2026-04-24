import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, title, content, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      setAnnouncements(data ?? []);
    };
    load();
  }, []);

  if (announcements.length === 0) return null;

  return (
    <section className="bg-primary/5 border-y border-primary/10">
      <div className="container py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold font-heading text-foreground">
              Avisos Importantes
            </h3>
            {announcements.map((a) => (
              <p key={a.id} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {new Date(a.created_at).toLocaleDateString("pt-BR")}:
                </span>{" "}
                {a.content}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementBanner;
