import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
];

const statusLabels: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-accent text-accent-foreground" },
  aprovada: { label: "Aprovada", className: "bg-secondary text-secondary-foreground" },
  recusada: { label: "Recusada", className: "bg-destructive text-destructive-foreground" },
};

interface Facility {
  id: string;
  name: string;
  capacity: number;
}

interface Reservation {
  id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  facilities: { name: string } | null;
}

const Reservas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchFacilities();
    fetchMyReservations();
  }, [user, navigate]);

  const fetchFacilities = async () => {
    const { data } = await supabase.from("facilities").select("id, name, capacity");
    if (data) setFacilities(data);
  };

  const fetchMyReservations = async () => {
    const { data } = await supabase
      .from("reservations")
      .select("id, reservation_date, start_time, end_time, status, notes, facilities(name)")
      .order("reservation_date", { ascending: false });
    if (data) setMyReservations(data as unknown as Reservation[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedFacility || !startTime || !endTime) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (startTime >= endTime) {
      toast.error("Horário final deve ser após o inicial");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("reservations").insert({
      user_id: user!.id,
      facility_id: selectedFacility,
      reservation_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: startTime,
      end_time: endTime,
      notes: notes || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Erro ao criar reserva: " + error.message);
    } else {
      toast.success("Reserva criada! Aguarde aprovação.");
      setSelectedFacility("");
      setSelectedDate(undefined);
      setStartTime("");
      setEndTime("");
      setNotes("");
      fetchMyReservations();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="gradient-hero py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold font-heading text-primary-foreground mb-2">Reservas</h1>
          <p className="text-primary-foreground/70">Reserve espaços do clube</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Nova Reserva
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Espaço</label>
                    <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                      <SelectTrigger><SelectValue placeholder="Selecione o espaço" /></SelectTrigger>
                      <SelectContent>
                        {facilities.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Data</label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={ptBR}
                      disabled={(date) => date < new Date()}
                      className={cn("rounded-md border p-3 pointer-events-auto")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Início</label>
                      <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger><SelectValue placeholder="Hora" /></SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Fim</label>
                      <Select value={endTime} onValueChange={setEndTime}>
                        <SelectTrigger><SelectValue placeholder="Hora" /></SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Observações</label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: torneio entre amigos..." />
                  </div>
                  <Button type="submit" className="w-full gradient-hero text-primary-foreground border-0" disabled={loading}>
                    {loading ? "Criando..." : "Solicitar Reserva"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* My Reservations */}
            <div>
              <h2 className="text-xl font-bold font-heading text-foreground mb-4">Minhas Reservas</h2>
              {myReservations.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma reserva ainda.</p>
              ) : (
                <div className="space-y-3">
                  {myReservations.map((r) => (
                    <Card key={r.id} className="shadow-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold font-heading text-foreground flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-primary" />
                              {r.facilities?.name || "Espaço"}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {format(new Date(r.reservation_date + "T00:00:00"), "dd/MM/yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {r.start_time.slice(0, 5)} — {r.end_time.slice(0, 5)}
                            </p>
                          </div>
                          <Badge className={`${statusLabels[r.status]?.className} border-0`}>
                            {statusLabels[r.status]?.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Reservas;
