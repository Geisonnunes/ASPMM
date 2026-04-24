import { useState, useEffect } from "react";
import { Bell, Search, ChevronDown, MessageSquare } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Users, CalendarDays, Megaphone, Image, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const searchOptions = [
  {
    label: "Usuários",
    description: "Buscar associados por nome ou CPF",
    icon: Users,
    path: "/admin/usuarios",
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

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return `há ${Math.floor(diff / 86400)} d`;
}

export function AppHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [openBell, setOpenBell] = useState(false);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    loadMensagens();
    const interval = setInterval(loadMensagens, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadMensagens = async () => {
    const { data } = await supabase
      .from("contact_messages")
      .select("id, name, message, created_at, is_read")
      .order("created_at", { ascending: false })
      .limit(5);
    const msgs = data ?? [];
    setMensagens(msgs);
    setNaoLidas(msgs.filter((m) => !m.is_read).length);
  };

  const handleOpenBell = () => {
    setOpenBell((v) => !v);
  };

  const handleVerTodas = async () => {
    setOpenBell(false);
    navigate("/admin/mensagens");
    // Marca como lidas
    await supabase
      .from("contact_messages")
      .update({ is_read: true } as any)
      .eq("is_read", false);
    setNaoLidas(0);
  };

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
    setOpenSearch(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filtered.length > 0)
      handleSelect(filtered[0].path);
    if (e.key === "Escape") setOpenSearch(false);
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
        <Popover open={openSearch} onOpenChange={setOpenSearch}>
          <PopoverTrigger asChild>
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários, eventos..."
                className="h-10 rounded-lg border-border bg-muted/50 pl-9 text-sm focus-visible:bg-card"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpenSearch(true);
                }}
                onFocus={() => setOpenSearch(true)}
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
                  heading={query.trim() ? "Ir para..." : "Navegar para"}
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

      {/* Ações do header */}
      <div className="ml-auto flex items-center gap-2">
        {/* Sino de notificações */}
        <Popover open={openBell} onOpenChange={setOpenBell}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-lg"
              onClick={handleOpenBell}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {naoLidas > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {naoLidas > 9 ? "9+" : naoLidas}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">
                Notificações
              </p>
              {naoLidas > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-[10px]">
                  {naoLidas} nova{naoLidas > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {mensagens.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma mensagem.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {mensagens.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${!m.is_read ? "bg-primary/[0.03]" : ""}`}
                    onClick={() => {
                      setOpenBell(false);
                      navigate("/admin/mensagens");
                    }}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {m.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {m.name}
                        </p>
                        {!m.is_read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-destructive" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.message}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {timeAgo(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                className="w-full text-sm text-primary hover:text-primary"
                onClick={handleVerTodas}
              >
                Ver todas
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Perfil */}
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
