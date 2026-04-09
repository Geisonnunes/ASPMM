import { CalendarDays, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  description: string;
  attendees: number;
  image: string;
  status?: "aberto" | "encerrado" | "em breve";
}

const statusColors: Record<string, string> = {
  aberto: "bg-secondary text-secondary-foreground",
  encerrado: "bg-muted text-muted-foreground",
  "em breve": "bg-accent text-accent-foreground",
};

const EventCard = ({ title, date, location, description, attendees, image, status = "aberto" }: EventCardProps) => (
  <Card className="overflow-hidden shadow-card hover:shadow-elevated transition-shadow group">
    <div className="relative h-48 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      <Badge className={`absolute top-3 right-3 ${statusColors[status]} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    </div>
    <CardContent className="p-5 space-y-3">
      <h3 className="text-lg font-bold font-heading text-card-foreground line-clamp-1">{title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{date}</span>
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{attendees} inscritos</span>
      </div>
    </CardContent>
  </Card>
);

export default EventCard;
