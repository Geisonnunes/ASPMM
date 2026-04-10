import { Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FacilityCardProps {
  name: string;
  description: string;
  capacity: number;
  rating: number;
  image: string;
}

const FacilityCard = ({
  name,
  description,
  capacity,
  rating,
  image,
}: FacilityCardProps) => (
  <Card className="h-full flex flex-col overflow-hidden shadow-card hover:shadow-elevated transition-all group cursor-pointer">
    {/* IMAGEM */}
    <div className="relative h-52 overflow-hidden">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
      <h3 className="absolute bottom-3 left-4 text-xl font-bold font-heading text-background">
        {name}
      </h3>
    </div>

    {/* CONTEÚDO */}
    <CardContent className="p-5 flex flex-col flex-1">
      {/* DESCRIÇÃO */}
      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
        {description}
      </p>

      {/* RODAPÉ FIXO */}
      <div className="flex items-center justify-between text-sm mt-4">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-4 w-4" />
          Até {capacity} pessoas
        </span>

        <span className="flex items-center gap-1 text-accent-foreground font-semibold">
          <Star className="h-4 w-4 fill-accent text-accent" />
          {rating.toFixed(1)}
        </span>
      </div>
    </CardContent>
  </Card>
);

export default FacilityCard;
