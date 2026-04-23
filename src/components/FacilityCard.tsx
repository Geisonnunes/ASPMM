import { useState, useEffect, useCallback } from "react";
import { Users, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import defaultFacilityImage from "@/assets/campo-society.jpg";

interface FacilityCardProps {
  name: string;
  description: string;
  capacity: number;
  rating: number;
  images: string[];
}

const FacilityCard = ({
  name,
  description,
  capacity,
  rating,
  images,
}: FacilityCardProps) => {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
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

  return (
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

        {/* Botões de navegação — aparecem só ao hover */}
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
      </CardContent>
    </Card>
  );
};

export default FacilityCard;

import type { FacilityRow } from "@/lib/facilityDisplay";
export type { FacilityRow };
