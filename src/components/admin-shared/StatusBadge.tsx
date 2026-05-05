import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  ativo: "bg-success-soft text-success border-success/20",
  agendado: "bg-success-soft text-success border-success/20",
  pendente: "bg-warning-soft text-warning border-warning/20",
  inativo: "bg-muted text-muted-foreground border-border",
  cancelado: "bg-destructive-soft text-destructive border-destructive/20",
  concluido: "bg-info-soft text-info border-info/20",
};

const labels: Record<string, string> = {
  ativo: "Ativo",
  agendado: "Agendado",
  pendente: "Pendente",
  inativo: "Inativo",
  cancelado: "Cancelado",
  concluido: "Concluído",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize",
        variants[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {labels[status] ?? status}
    </Badge>
  );
}
