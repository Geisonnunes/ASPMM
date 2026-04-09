import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CalendarDays, Users, MapPin, Bell, Settings, Plus, Check, X, Trash2, LayoutDashboard,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, authLoading]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="gradient-hero py-10">
        <div className="container">
          <h1 className="text-3xl font-extrabold font-heading text-primary-foreground flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8" />
            Painel Administrativo
          </h1>
        </div>
      </section>
      <section className="py-8">
        <div className="container">
          <Tabs defaultValue="reservas">
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="reservas"><CalendarDays className="mr-1 h-4 w-4" />Reservas</TabsTrigger>
              <TabsTrigger value="eventos"><CalendarDays className="mr-1 h-4 w-4" />Eventos</TabsTrigger>
              <TabsTrigger value="usuarios"><Users className="mr-1 h-4 w-4" />Usuários</TabsTrigger>
              <TabsTrigger value="espacos"><MapPin className="mr-1 h-4 w-4" />Espaços</TabsTrigger>
              <TabsTrigger value="avisos"><Bell className="mr-1 h-4 w-4" />Avisos</TabsTrigger>
            </TabsList>

            <TabsContent value="reservas"><AdminReservations /></TabsContent>
            <TabsContent value="eventos"><AdminEvents /></TabsContent>
            <TabsContent value="usuarios"><AdminUsers /></TabsContent>
            <TabsContent value="espacos"><AdminFacilities /></TabsContent>
            <TabsContent value="avisos"><AdminAnnouncements /></TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

// ========== RESERVATIONS TAB ==========
function AdminReservations() {
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase
      .from("reservations")
      .select("*, facilities(name), profiles:user_id(full_name)")
      .order("reservation_date", { ascending: false });
    if (data) setReservations(data);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Reserva ${status}!`); fetch(); }
  };

  const statusColors: Record<string, string> = {
    pendente: "bg-accent text-accent-foreground",
    aprovada: "bg-secondary text-secondary-foreground",
    recusada: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="space-y-3">
      {reservations.length === 0 && <p className="text-muted-foreground">Nenhuma reserva.</p>}
      {reservations.map((r) => (
        <Card key={r.id} className="shadow-card">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-semibold font-heading text-foreground">{(r.facilities as any)?.name}</p>
              <p className="text-sm text-muted-foreground">
                {(r.profiles as any)?.full_name || "Usuário"} · {format(new Date(r.reservation_date + "T00:00:00"), "dd/MM/yyyy")} · {r.start_time?.slice(0,5)}–{r.end_time?.slice(0,5)}
              </p>
              {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusColors[r.status]} border-0`}>{r.status}</Badge>
              {r.status === "pendente" && (
                <>
                  <Button size="sm" variant="outline" className="text-secondary border-secondary" onClick={() => updateStatus(r.id, "aprovada")}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive" onClick={() => updateStatus(r.id, "recusada")}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ========== EVENTS TAB ==========
function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("aberto");
  const [maxAttendees, setMaxAttendees] = useState("");

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    if (data) setEvents(data);
  };

  const handleCreate = async () => {
    if (!title || !eventDate) { toast.error("Título e data obrigatórios"); return; }
    const { error } = await supabase.from("events").insert({
      title, description, event_date: eventDate, location, status,
      max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Evento criado!"); setOpen(false); setTitle(""); setDescription(""); fetch(); }
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Evento excluído"); fetch(); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold font-heading">Eventos</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-hero text-primary-foreground border-0"><Plus className="mr-1 h-4 w-4" />Novo Evento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">Criar Evento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <Input placeholder="Local" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Input type="number" placeholder="Máx. participantes" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em breve">Em Breve</SelectItem>
                  <SelectItem value="encerrado">Encerrado</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreate} className="w-full gradient-hero text-primary-foreground border-0">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {events.map((e) => (
          <Card key={e.id} className="shadow-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold font-heading">{e.title}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(e.event_date), "dd/MM/yyyy HH:mm")} · {e.location || "—"}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="outline">{e.status}</Badge>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteEvent(e.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ========== USERS TAB ==========
function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data);
  };

  const statusColors: Record<string, string> = {
    ativo: "bg-secondary text-secondary-foreground",
    inadimplente: "bg-destructive text-destructive-foreground",
    suspenso: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold font-heading mb-4">Associados ({users.length})</h3>
      {users.map((u) => (
        <Card key={u.id} className="shadow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold font-heading">{u.full_name || "Sem nome"}</p>
              <p className="text-sm text-muted-foreground">{u.phone || "—"} · {u.cpf || "—"}</p>
            </div>
            <Badge className={`${statusColors[u.membership_status]} border-0`}>{u.membership_status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ========== FACILITIES TAB ==========
function AdminFacilities() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [rules, setRules] = useState("");

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from("facilities").select("*").order("name");
    if (data) setFacilities(data);
  };

  const handleCreate = async () => {
    if (!name) { toast.error("Nome obrigatório"); return; }
    const { error } = await supabase.from("facilities").insert({
      name, description, capacity: parseInt(capacity) || 0, rules,
    });
    if (error) toast.error(error.message);
    else { toast.success("Espaço criado!"); setOpen(false); setName(""); fetch(); }
  };

  const deleteFacility = async (id: string) => {
    const { error } = await supabase.from("facilities").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Espaço excluído"); fetch(); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold font-heading">Espaços</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-hero text-primary-foreground border-0"><Plus className="mr-1 h-4 w-4" />Novo Espaço</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">Criar Espaço</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
              <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input type="number" placeholder="Capacidade" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              <Textarea placeholder="Regras de uso" value={rules} onChange={(e) => setRules(e.target.value)} />
              <Button onClick={handleCreate} className="w-full gradient-hero text-primary-foreground border-0">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {facilities.map((f) => (
          <Card key={f.id} className="shadow-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold font-heading">{f.name}</p>
                <p className="text-sm text-muted-foreground">Capacidade: {f.capacity} · Avaliação: {f.rating}</p>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteFacility(f.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ========== ANNOUNCEMENTS TAB ==========
function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (data) setAnnouncements(data);
  };

  const handleCreate = async () => {
    if (!title || !content) { toast.error("Preencha todos os campos"); return; }
    const { error } = await supabase.from("announcements").insert({ title, content });
    if (error) toast.error(error.message);
    else { toast.success("Aviso publicado!"); setOpen(false); setTitle(""); setContent(""); fetch(); }
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Aviso excluído"); fetch(); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold font-heading">Avisos</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-hero text-primary-foreground border-0"><Plus className="mr-1 h-4 w-4" />Novo Aviso</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">Criar Aviso</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Conteúdo" value={content} onChange={(e) => setContent(e.target.value)} />
              <Button onClick={handleCreate} className="w-full gradient-hero text-primary-foreground border-0">Publicar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {announcements.map((a) => (
          <Card key={a.id} className="shadow-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold font-heading">{a.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{a.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{format(new Date(a.created_at), "dd/MM/yyyy")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={a.is_active ? "default" : "outline"}>{a.is_active ? "Ativo" : "Inativo"}</Badge>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteAnnouncement(a.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Admin;
