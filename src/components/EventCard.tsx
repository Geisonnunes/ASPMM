import { useState } from "react";
import { CalendarDays, MapPin, Users, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

const WHATSAPP_NUMBER = "5514996402112";

export type EventCardStatus = "aberto" | "em breve" | "encerrado";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  attendees: number;
  image: string;
  status: EventCardStatus;
}

const EventCard = ({
  id,
  title,
  date,
  location,
  description,
  attendees,
  image,
  status,
}: EventCardProps) => {
  const { user, profile } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [pessoas, setPessoas] = useState("1");

  const handleWhatsApp = () => {
    const qtd = parseInt(pessoas) || 1;
    const message =
      `Olá! Gostaria de confirmar minha presença no evento abaixo:\n\n` +
      `*Evento:* ${title}\n` +
      `*Data:* ${date}\n` +
      `*Local:* ${location}\n` +
      `*Numero de pessoas:* ${qtd}\n` +
      `*Nome:* ${profile?.full_name ?? "Associado"}\n\n` +
      `Aguardo confirmacao. Obrigado(a)!`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    setOpenDialog(false);
    setPessoas("1");
  };

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden shadow-card hover:shadow-elevated transition-all group cursor-pointer">
        {/* IMAGEM */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <span
            className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-md font-semibold ${
              status === "aberto"
                ? "bg-green-500 text-white"
                : status === "em breve"
                  ? "bg-yellow-500 text-white"
                  : "bg-muted-foreground text-background"
            }`}
          >
            {status}
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <h3 className="absolute bottom-3 left-4 text-lg font-bold text-background">
            {title}
          </h3>
        </div>

        {/* CONTEÚDO */}
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="text-sm text-muted-foreground space-y-1 mb-2">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {location}
            </span>
          </div>
          <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center justify-between text-sm mt-4">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              {attendees} participantes
            </span>
          </div>

          {/* Botão confirmar presença — só para associados logados e eventos abertos */}
          {user && status === "aberto" && (
            <Button className="mt-4 w-full" onClick={() => setOpenDialog(true)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Confirmar Presença
            </Button>
          )}
        </CardContent>
      </Card>

      {/* DIALOG confirmar presença */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Confirmar Presença
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1 mb-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-semibold text-foreground">🎉 {title}</p>
            <p className="text-xs text-muted-foreground">
              📅 {date} · 📍 {location}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Número de pessoas *</Label>
              <Input
                type="number"
                min="1"
                max={attendees || 99}
                value={pessoas}
                onChange={(e) => setPessoas(e.target.value)}
                className="mt-1"
              />
              {attendees > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo de {attendees} participantes neste evento.
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Você será redirecionado ao WhatsApp com os dados preenchidos. A
              confirmação fica sujeita à disponibilidade de vagas.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpenDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleWhatsApp}
                disabled={!pessoas || parseInt(pessoas) < 1}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Abrir WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventCard;
