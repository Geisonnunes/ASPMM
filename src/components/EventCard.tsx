import { CalendarDays, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  description: string;
  attendees: number;
  image: string;
  status: "aberto" | "em breve";
}

const EventCard = ({
  title,
  date,
  location,
  description,
  attendees,
  image,
  status,
}: EventCardProps) => (
  <Card className="h-full flex flex-col overflow-hidden shadow-card hover:shadow-elevated transition-all group cursor-pointer">
    {/* IMAGEM */}
    <div className="relative h-52 overflow-hidden">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      {/* STATUS */}
      <span
        className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-md font-semibold ${
          status === "aberto"
            ? "bg-green-500 text-white"
            : "bg-yellow-500 text-white"
        }`}
      >
        {status}
      </span>

      {/* GRADIENT + TÍTULO */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
      <h3 className="absolute bottom-3 left-4 text-lg font-bold text-background">
        {title}
      </h3>
    </div>

    {/* CONTEÚDO */}
    <CardContent className="p-5 flex flex-col flex-1">
      {/* INFO */}
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

      {/* DESCRIÇÃO */}
      <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
        {description}
      </p>

      {/* RODAPÉ */}
      <div className="flex items-center justify-between text-sm mt-4">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-4 w-4" />
          {attendees} participantes
        </span>
      </div>
    </CardContent>
  </Card>
);

export default EventCard;
