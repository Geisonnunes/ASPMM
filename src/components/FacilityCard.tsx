import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
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
import defaultFacilityImage from "@/assets/campo-society.jpg";
import { useAuth } from "@/contexts/AuthContext";

const WHATSAPP_NUMBER = "5514996402112";

interface FacilityCardProps {
  id: string;
  name: string;
  description: string;
  capacity: number;
  rating: number;
  images: string[];
  reservaAtiva?: boolean;
}

const FacilityCard = ({
  name,
  description,
  capacity,
  rating,
  images,
  reservaAtiva = true,
}: FacilityCardProps) => {
  const { user } = useAuth();
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const hasMultiple = images.length > 1;

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
    }, 300);
  }, []);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    goTo(current === 0 ? images.length - 1 : current - 1);
  };

  const next = useCallback(() => {
    goTo(current === images.length - 1 ? 0 : current + 1);
  }, [current, images.length, goTo]);

  useEffect(() => {
    if (!hasMultiple) return;
    const interval = setInterval(next, 3500);
    return () => clearInterval(interval);
  }, [hasMultiple, next]);

  const handleWhatsApp = () => {
    if (!date || !time) return;

    const dateBR = new Date(date).toLocaleDateString("pt-BR");
    const message =
      `Olá! Sou associado(a) da ASPMM e gostaria de verificar a disponibilidade para reserva do espaço abaixo:\n\n` +
      `*Espaço:* ${name}\n` +
      `*Data desejada:* ${dateBR}\n` +
      `*Horário desejado:* ${time}\n\n` +
      `Aguardo confirmação. Obrigado(a)!`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    setOpenDialog(false);
    setDate("");
    setTime("");
  };

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden shadow-card hover:shadow-elevated transition-all group cursor-pointer">
        {/* CARROSSEL */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={images[current] ?? defaultFacilityImage}
            alt={`${name} - foto ${current + 1}`}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <h3 className="absolute bottom-3 left-4 text-xl font-bold font-heading text-background">
            {name}
          </h3>

          {hasMultiple && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* CONTEÚDO */}
        <CardContent className="p-5 flex flex-col flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {description}
          </p>
          <div className="flex items-center justify-between text-sm mt-4">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              Até {capacity} pessoas
            </span>
            {rating > 0 && (
              <span className="flex items-center gap-1 text-accent-foreground font-semibold">
                <Star className="h-4 w-4 fill-accent text-accent" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Botão reservar — só aparece para associados logados e se reservas estiverem ativas */}
          {user && reservaAtiva && (
            <Button className="mt-4 w-full" onClick={() => setOpenDialog(true)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Solicitar Reserva
            </Button>
          )}
        </CardContent>
      </Card>

      {/* DIALOG de reserva */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Solicitar Reserva
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1 mb-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-semibold text-foreground">📍 {name}</p>
            <p className="text-xs text-muted-foreground">
              Capacidade: até {capacity} pessoas
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Data desejada *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={
                  new Date(
                    new Date().getTime() -
                      new Date().getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .split("T")[0]
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Horário desejado *</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Você será redirecionado ao WhatsApp com os dados preenchidos. A
              confirmação fica sujeita à disponibilidade.
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
                disabled={!date || !time}
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

export default FacilityCard;

import type { FacilityRow } from "@/lib/facilityDisplay";
export type { FacilityRow };
