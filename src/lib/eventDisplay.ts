import { format } from "date-fns";
import defaultEventImage from "@/assets/campo-society.jpg";

export type EventStatus = "aberto" | "em breve" | "encerrado";

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  max_attendees: number | null;
  status: string;
  image_url: string | null;
};

export function normalizeEventStatus(s: string): EventStatus {
  if (s === "em breve" || s === "encerrado" || s === "aberto") return s;
  return "aberto";
}

export function eventRowToCardProps(row: EventRow) {
  const status = normalizeEventStatus(row.status);
  return {
    id: row.id,
    title: row.title,
    date: format(new Date(row.event_date), "dd/MM/yyyy 'às' HH:mm"),
    location: row.location ?? "—",
    description: row.description ?? "",
    attendees: row.max_attendees ?? 0,
    image: row.image_url?.trim() || defaultEventImage,
    status,
  };
}

/** Valor para `<input type="datetime-local" />` no fuso local. */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
