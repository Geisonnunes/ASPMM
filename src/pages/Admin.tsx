import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CalendarDays,
  Users,
  MapPin,
  Bell,
  Plus,
  Check,
  X,
  Trash2,
  LayoutDashboard,
  FileText,
  Pencil,
  Camera,
  Mail,
} from "lucide-react";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminGallery from "@/components/admin/AdminGallery";
import { skipAdminGuard } from "@/lib/devFlags";
import { toDatetimeLocalValue } from "@/lib/eventDisplay";
import {
  removePhotosObjectByUrl,
  uploadToPhotosBucket,
} from "@/lib/storageUpload";

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (skipAdminGuard) return;
    if (!authLoading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading && !skipAdminGuard)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  if (!skipAdminGuard && !isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="gradient-hero py-10">
        <div className="container flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-3xl font-extrabold font-heading text-primary-foreground flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8" />
            Painel Administrativo
          </h1>
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="shrink-0 self-start sm:self-auto"
          >
            <Link to="/admin/conteudo">
              <FileText className="mr-2 h-4 w-4" />
              Conteúdo do site
            </Link>
          </Button>
        </div>
      </section>
      <section className="py-8">
        <div className="container">
          <Tabs defaultValue="reservas">
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="reservas">
                <CalendarDays className="mr-1 h-4 w-4" />
                Reservas
              </TabsTrigger>
              <TabsTrigger value="eventos">
                <CalendarDays className="mr-1 h-4 w-4" />
                Eventos
              </TabsTrigger>
              <TabsTrigger value="usuarios">
                <Users className="mr-1 h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="espacos">
                <MapPin className="mr-1 h-4 w-4" />
                Espaços
              </TabsTrigger>
              <TabsTrigger value="avisos">
                <Bell className="mr-1 h-4 w-4" />
                Avisos
              </TabsTrigger>
              <TabsTrigger value="galeria">
                <Camera className="mr-1 h-4 w-4" />
                Galeria
              </TabsTrigger>
              <TabsTrigger value="mensagens">
                <Mail className="mr-1 h-4 w-4" />
                Mensagens
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reservas">
              <AdminReservations />
            </TabsContent>
            <TabsContent value="eventos">
              <AdminEvents />
            </TabsContent>
            <TabsContent value="usuarios">
              <AdminUsers />
            </TabsContent>
            <TabsContent value="espacos">
              <AdminFacilities />
            </TabsContent>
            <TabsContent value="avisos">
              <AdminAnnouncements />
            </TabsContent>
            <TabsContent value="galeria">
              <AdminGallery />
            </TabsContent>
            <TabsContent value="mensagens">
              <AdminMessages />
            </TabsContent>
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

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const { data } = await supabase
      .from("reservations")
      .select("*, facilities(name), profiles:user_id(full_name)")
      .order("reservation_date", { ascending: false });
    if (data) setReservations(data);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status } as any)
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Reserva ${status}!`);
      fetch();
    }
  };

  const statusColors: Record<string, string> = {
    pendente: "bg-accent text-accent-foreground",
    aprovada: "bg-secondary text-secondary-foreground",
    recusada: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="space-y-3">
      {reservations.length === 0 && (
        <p className="text-muted-foreground">Nenhuma reserva.</p>
      )}
      {reservations.map((r) => (
        <Card key={r.id} className="shadow-card">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-semibold font-heading text-foreground">
                {(r.facilities as any)?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(r.profiles as any)?.full_name || "Usuário"} ·{" "}
                {format(
                  new Date(r.reservation_date + "T00:00:00"),
                  "dd/MM/yyyy",
                )}{" "}
                · {r.start_time?.slice(0, 5)}–{r.end_time?.slice(0, 5)}
              </p>
              {r.notes && (
                <p className="text-xs text-muted-foreground">{r.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusColors[r.status]} border-0`}>
                {r.status}
              </Badge>
              {r.status === "pendente" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-secondary border-secondary"
                    onClick={() => updateStatus(r.id, "aprovada")}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive"
                    onClick={() => updateStatus(r.id, "recusada")}
                  >
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
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("aberto");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previousImageUrl, setPreviousImageUrl] = useState<string | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const resetEventForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setEventDate("");
    setLocation("");
    setStatus("aberto");
    setMaxAttendees("");
    setImageUrl("");
    setImageFile(null);
    setPreviousImageUrl(null);
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
  };

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });
    if (data) setEvents(data);
  };

  const handleCreate = async () => {
    if (!title || !eventDate) {
      toast.error("Título e data obrigatórios");
      return;
    }
    const initialUrl = imageFile ? null : imageUrl.trim() || null;
    const { data: inserted, error } = await supabase
      .from("events")
      .insert({
        title,
        description,
        event_date: eventDate,
        location,
        status,
        max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
        image_url: initialUrl,
      })
      .select("id")
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    if (imageFile && inserted?.id) {
      const up = await uploadToPhotosBucket(imageFile, `events/${inserted.id}`);
      if ("error" in up) {
        toast.error(`Evento criado, mas imagem falhou: ${up.error}`);
      } else {
        await supabase
          .from("events")
          .update({ image_url: up.publicUrl } as any)
          .eq("id", inserted.id);
      }
    }
    toast.success("Evento criado!");
    setOpen(false);
    resetEventForm();
    fetch();
  };

  const openEdit = (e: (typeof events)[0]) => {
    setEditingId(e.id);
    setTitle(e.title);
    setDescription(e.description ?? "");
    setEventDate(toDatetimeLocalValue(e.event_date));
    setLocation(e.location ?? "");
    setStatus(e.status);
    setMaxAttendees(e.max_attendees != null ? String(e.max_attendees) : "");
    setImageUrl(e.image_url ?? "");
    setPreviousImageUrl(e.image_url ?? null);
    setImageFile(null);
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingId || !title || !eventDate) {
      toast.error("Título e data obrigatórios");
      return;
    }
    let nextImageUrl = imageUrl.trim() || null;
    if (imageFile) {
      const up = await uploadToPhotosBucket(imageFile, `events/${editingId}`);
      if ("error" in up) {
        toast.error(up.error);
        return;
      }
      nextImageUrl = up.publicUrl;
      if (previousImageUrl && previousImageUrl !== nextImageUrl) {
        await removePhotosObjectByUrl(previousImageUrl);
      }
    }
    const eventUpdatePayload = {
      title,
      description,
      event_date: eventDate,
      location,
      status,
      max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
      image_url: nextImageUrl,
    } as any;
    const { error } = await supabase
      .from("events")
      .update(eventUpdatePayload)
      .eq("id", editingId);
    if (error) toast.error(error.message);
    else {
      toast.success("Evento atualizado!");
      setEditOpen(false);
      resetEventForm();
      fetch();
    }
  };

  const deleteEvent = async (id: string) => {
    const row = events.find((x) => x.id === id);
    if (row?.image_url) await removePhotosObjectByUrl(row.image_url);
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Evento excluído");
      fetch();
    }
  };

  const eventFormFields = (
    <>
      <Input
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        type="datetime-local"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
      />
      <Input
        placeholder="Local"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <Input
        placeholder="URL da imagem (opcional; ignorada se escolher ficheiro)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <div className="space-y-2">
        <Label htmlFor="event-image-file">Ou enviar imagem</Label>
        <Input
          ref={imageFileInputRef}
          id="event-image-file"
          type="file"
          accept="image/*"
          className="cursor-pointer"
          onChange={(e) => setImageFile(e.target.files?.item(0) ?? null)}
        />
        {imageFile && (
          <p className="text-xs text-muted-foreground">{imageFile.name}</p>
        )}
      </div>
      <Input
        type="number"
        placeholder="Máx. participantes"
        value={maxAttendees}
        onChange={(e) => setMaxAttendees(e.target.value)}
      />
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="aberto">Aberto</SelectItem>
          <SelectItem value="em breve">Em Breve</SelectItem>
          <SelectItem value="encerrado">Encerrado</SelectItem>
        </SelectContent>
      </Select>
    </>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold font-heading">Eventos</h3>
        <>
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) resetEventForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gradient-hero text-primary-foreground border-0"
                onClick={() => {
                  resetEventForm();
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">Criar Evento</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {eventFormFields}
                <Button
                  onClick={handleCreate}
                  className="w-full gradient-hero text-primary-foreground border-0"
                >
                  Criar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={editOpen}
            onOpenChange={(v) => {
              setEditOpen(v);
              if (!v) resetEventForm();
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Editar Evento
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {eventFormFields}
                <Button
                  onClick={handleUpdate}
                  className="w-full gradient-hero text-primary-foreground border-0"
                >
                  Guardar alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      </div>
      <div className="space-y-3">
        {events.map((e) => (
          <Card key={e.id} className="shadow-card">
            <CardContent className="p-4 flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold font-heading">{e.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(e.event_date), "dd/MM/yyyy HH:mm")} ·{" "}
                  {e.location || "—"}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="outline">{e.status}</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(e)}
                  aria-label="Editar evento"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => deleteEvent(e.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Senha provisória retornada pela Edge Function — exibida após cadastro
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [nomeCadastrado, setNomeCadastrado] = useState("");

  // Campos do formulário
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data);
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setCpf("");
    setSenhaGerada(null);
    setNomeCadastrado("");
  };

  const handleCadastrar = async () => {
    if (!fullName || !email) {
      toast.error("Nome e e-mail são obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

      // 1. Gera senha provisória
      const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
      const array = new Uint8Array(12);
      crypto.getRandomValues(array);
      const senhaProvisoria = Array.from(
        array,
        (b) => chars[b % chars.length],
      ).join("");

      // 2. Cria o usuário via API Admin
      const resUser = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        body: JSON.stringify({
          email,
          password: senhaProvisoria,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        }),
      });

      const userData = await resUser.json();

      if (!resUser.ok) {
        toast.error(
          "Erro ao cadastrar: " +
            (userData?.msg ?? userData?.message ?? `Erro ${resUser.status}`),
        );
        setLoading(false);
        return;
      }

      const userId = userData.id;

      // 3. Aguarda o trigger criar o profile
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 4. Atualiza o profile com os dados extras usando o cliente normal
      //    (permitido pela nova policy "Admins update any profile")
      const cpfLimpo = cpf ? cpf.replace(/\D/g, "") : null;
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone || null,
          cpf: cpfLimpo,
          must_change_password: true,
        })
        .eq("id", userId);

      if (profileError) {
        console.error(
          "[Admin] Erro ao atualizar profile:",
          profileError.message,
        );
        toast.error(
          "Usuário criado, mas erro ao salvar dados: " + profileError.message,
        );
        setLoading(false);
        return;
      }

      // 5. Exibe senha provisória para o admin anotar
      setNomeCadastrado(fullName);
      setSenhaGerada(senhaProvisoria);
      loadUsers();
    } catch (err: any) {
      toast.error("Erro ao cadastrar: " + err.message);
    }

    setLoading(false);
  };

  const statusColors: Record<string, string> = {
    ativo: "bg-secondary text-secondary-foreground",
    inadimplente: "bg-destructive text-destructive-foreground",
    suspenso: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold font-heading">
          Associados ({users.length})
        </h3>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Novo Associado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">
                Cadastrar Associado
              </DialogTitle>
            </DialogHeader>

            {/* ── Estado: senha gerada com sucesso ── */}
            {senhaGerada ? (
              <div className="space-y-4 mt-2">
                <div className="rounded-lg border border-secondary bg-secondary/10 p-4 space-y-2">
                  <p className="font-semibold text-foreground">
                    ✅ {nomeCadastrado} cadastrado com sucesso!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Entregue a senha provisória abaixo ao associado. Ele deverá
                    criar uma senha pessoal no primeiro acesso.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 text-base font-mono tracking-widest select-all">
                      {senhaGerada}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(senhaGerada);
                        toast.success("Senha copiada!");
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                    }}
                  >
                    Cadastrar outro
                  </Button>
                  <Button
                    onClick={() => {
                      resetForm();
                      setOpen(false);
                    }}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Estado: formulário de cadastro ── */
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="João da Silva"
                  />
                </div>
                <div>
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="associado@email.com"
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(14) 99999-0000"
                  />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Uma senha provisória será gerada automaticamente. O associado
                  deverá alterá-la no primeiro acesso.
                </p>
                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCadastrar} disabled={loading}>
                    {loading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {users.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum associado cadastrado ainda.
        </p>
      )}

      {users.map((u) => (
        <Card key={u.id} className="shadow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold font-heading">
                {u.full_name || "Sem nome"}
              </p>
              <p className="text-sm text-muted-foreground">
                {u.phone || "—"} · {u.cpf || "—"}
              </p>
            </div>
            <Badge className={`${statusColors[u.membership_status]} border-0`}>
              {u.membership_status}
            </Badge>
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
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [rules, setRules] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previousImageUrl, setPreviousImageUrl] = useState<string | null>(null);
  const [rating, setRating] = useState("");
  const facilityImageInputRef = useRef<HTMLInputElement>(null);

  const resetFacilityForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setCapacity("");
    setRules("");
    setImageUrl("");
    setImageFile(null);
    setPreviousImageUrl(null);
    setRating("");
    if (facilityImageInputRef.current) facilityImageInputRef.current.value = "";
  };

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const { data } = await supabase
      .from("facilities")
      .select("*")
      .order("name");
    if (data) setFacilities(data);
  };

  const handleCreate = async () => {
    if (!name) {
      toast.error("Nome obrigatório");
      return;
    }
    const initialUrl = imageFile ? null : imageUrl.trim() || null;
    const { data: inserted, error } = await supabase
      .from("facilities")
      .insert({
        name,
        description,
        capacity: parseInt(capacity) || 0,
        rules,
        image_url: initialUrl,
        rating: rating ? parseFloat(rating) : 0,
      })
      .select("id")
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    if (imageFile && inserted?.id) {
      const up = await uploadToPhotosBucket(
        imageFile,
        `facilities/${inserted.id}`,
      );
      if ("error" in up) {
        toast.error(`Espaço criado, mas imagem falhou: ${up.error}`);
      } else {
        await supabase
          .from("facilities")
          .update({ image_url: up.publicUrl } as any)
          .eq("id", inserted.id);
      }
    }
    toast.success("Espaço criado!");
    setOpen(false);
    resetFacilityForm();
    fetch();
  };

  const openEdit = (f: (typeof facilities)[0]) => {
    setEditingId(f.id);
    setName(f.name);
    setDescription(f.description ?? "");
    setCapacity(String(f.capacity ?? ""));
    setRules(f.rules ?? "");
    setImageUrl(f.image_url ?? "");
    setPreviousImageUrl(f.image_url ?? null);
    setImageFile(null);
    if (facilityImageInputRef.current) facilityImageInputRef.current.value = "";
    setRating(f.rating != null ? String(f.rating) : "");
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingId || !name) {
      toast.error("Nome obrigatório");
      return;
    }
    let nextImageUrl = imageUrl.trim() || null;
    if (imageFile) {
      const up = await uploadToPhotosBucket(
        imageFile,
        `facilities/${editingId}`,
      );
      if ("error" in up) {
        toast.error(up.error);
        return;
      }
      nextImageUrl = up.publicUrl;
      if (previousImageUrl && previousImageUrl !== nextImageUrl) {
        await removePhotosObjectByUrl(previousImageUrl);
      }
    }
    const facilityUpdatePayload = {
      name,
      description,
      capacity: parseInt(capacity) || 0,
      rules,
      image_url: nextImageUrl,
      rating: rating ? parseFloat(rating) : 0,
    } as any;
    const { error } = await supabase
      .from("facilities")
      .update(facilityUpdatePayload)
      .eq("id", editingId);
    if (error) toast.error(error.message);
    else {
      toast.success("Espaço atualizado!");
      setEditOpen(false);
      resetFacilityForm();
      fetch();
    }
  };

  const deleteFacility = async (id: string) => {
    const row = facilities.find((x) => x.id === id);
    if (row?.image_url) await removePhotosObjectByUrl(row.image_url);
    const { error } = await supabase.from("facilities").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Espaço excluído");
      fetch();
    }
  };

  const facilityFormFields = (
    <>
      <Input
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Textarea
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        placeholder="URL da imagem (opcional; ignorada se escolher ficheiro)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <div className="space-y-2">
        <Label htmlFor="facility-image-file">Ou enviar imagem</Label>
        <Input
          ref={facilityImageInputRef}
          id="facility-image-file"
          type="file"
          accept="image/*"
          className="cursor-pointer"
          onChange={(e) => setImageFile(e.target.files?.item(0) ?? null)}
        />
        {imageFile && (
          <p className="text-xs text-muted-foreground">{imageFile.name}</p>
        )}
      </div>
      <Input
        type="number"
        placeholder="Capacidade"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
      />
      <Input
        type="number"
        step="0.1"
        min={0}
        max={5}
        placeholder="Avaliação (0–5)"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />
      <Textarea
        placeholder="Regras de uso"
        value={rules}
        onChange={(e) => setRules(e.target.value)}
      />
    </>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold font-heading">Espaços</h3>
        <>
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) resetFacilityForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gradient-hero text-primary-foreground border-0"
                onClick={() => resetFacilityForm()}
              >
                <Plus className="mr-1 h-4 w-4" />
                Novo Espaço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">Criar Espaço</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {facilityFormFields}
                <Button
                  onClick={handleCreate}
                  className="w-full gradient-hero text-primary-foreground border-0"
                >
                  Criar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={editOpen}
            onOpenChange={(v) => {
              setEditOpen(v);
              if (!v) resetFacilityForm();
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Editar Espaço
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {facilityFormFields}
                <Button
                  onClick={handleUpdate}
                  className="w-full gradient-hero text-primary-foreground border-0"
                >
                  Guardar alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      </div>
      <div className="space-y-3">
        {facilities.map((f) => (
          <Card key={f.id} className="shadow-card">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold font-heading">{f.name}</p>
                <p className="text-sm text-muted-foreground">
                  Capacidade: {f.capacity} · Avaliação: {f.rating}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(f)}
                  aria-label="Editar espaço"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => deleteFacility(f.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAnnouncements(data);
  };

  const handleCreate = async () => {
    if (!title || !content) {
      toast.error("Preencha todos os campos");
      return;
    }
    const { error } = await supabase
      .from("announcements")
      .insert({ title, content });
    if (error) toast.error(error.message);
    else {
      toast.success("Aviso publicado!");
      setOpen(false);
      setTitle("");
      setContent("");
      fetch();
    }
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Aviso excluído");
      fetch();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold font-heading">Avisos</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gradient-hero text-primary-foreground border-0"
            >
              <Plus className="mr-1 h-4 w-4" />
              Novo Aviso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Criar Aviso</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Conteúdo"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button
                onClick={handleCreate}
                className="w-full gradient-hero text-primary-foreground border-0"
              >
                Publicar
              </Button>
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
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {a.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(a.created_at), "dd/MM/yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={a.is_active ? "default" : "outline"}>
                  {a.is_active ? "Ativo" : "Inativo"}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => deleteAnnouncement(a.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Admin;
