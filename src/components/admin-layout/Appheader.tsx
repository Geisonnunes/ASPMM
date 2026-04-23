import { useState } from "react";
import { Bell, Search, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Megaphone,
  Image,
  MessageSquare,
  FileText,
} from "lucide-react";

const searchOptions = [
  {
    label: "Usuários",
    description: "Buscar associados por nome ou CPF",
    icon: Users,
    path: "/admin/usuarios",
  },
  {
    label: "Reservas",
    description: "Buscar reservas por associado ou espaço",
    icon: CalendarCheck,
    path: "/admin/reservas",
  },
  {
    label: "Eventos",
    description: "Buscar eventos por título",
    icon: CalendarDays,
    path: "/admin/eventos",
  },
  {
    label: "Avisos",
    description: "Buscar avisos por título",
    icon: Megaphone,
    path: "/admin/avisos",
  },
  {
    label: "Galeria",
    description: "Buscar álbuns por título",
    icon: Image,
    path: "/admin/galeria",
  },
  {
    label: "Mensagens",
    description: "Buscar mensagens de contato",
    icon: MessageSquare,
    path: "/admin/mensagens",
  },
  {
    label: "Conteúdo",
    description: "Editar textos do site",
    icon: FileText,
    path: "/admin/conteudo",
  },
];

export function AppHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered =
    query.trim().length > 0
      ? searchOptions.filter(
          (o) =>
            o.label.toLowerCase().includes(query.toLowerCase()) ||
            o.description.toLowerCase().includes(query.toLowerCase()),
        )
      : searchOptions;

  const handleSelect = (path: string) => {
    navigate(`${path}?q=${encodeURIComponent(query)}`);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filtered.length > 0) {
      handleSelect(filtered[0].path);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />

      {/* Barra de busca */}
      <div className="hidden flex-1 md:block">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar reservas, usuários, eventos..."
                className="h-10 rounded-lg border-border bg-muted/50 pl-9 text-sm focus-visible:bg-card"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[380px] p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList>
                <CommandGroup
                  heading={query.trim() ? `Ir para...` : "Navegar para"}
                >
                  {filtered.map((option) => (
                    <CommandItem
                      key={option.path}
                      onSelect={() => handleSelect(option.path)}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <option.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                  {filtered.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Nenhuma seção encontrada.
                    </p>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Perfil */}
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 gap-2 rounded-lg px-2 hover:bg-muted"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start leading-tight md:flex">
                <span className="text-sm font-semibold text-foreground">
                  {profile?.full_name ?? "Admin"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Administrador
                </span>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/")}>
              Ver site público
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
