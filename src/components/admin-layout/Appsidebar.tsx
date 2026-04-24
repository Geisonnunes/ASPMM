import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MapPin,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Eventos", url: "/admin/eventos", icon: CalendarDays },
  { title: "Usuários", url: "/admin/usuarios", icon: Users },
  { title: "Espaços", url: "/admin/espacos", icon: MapPin },
  { title: "Galeria", url: "/admin/galeria", icon: ImageIcon },
  { title: "Mensagens", url: "/admin/mensagens", icon: MessageSquare },
  { title: "Informações", url: "/admin/informacoes", icon: HelpCircle },
  { title: "Conteúdo do Site", url: "/admin/conteudo", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      setNaoLidas(count ?? 0);
    };
    load();
    const interval = setInterval(load, 60000); // atualiza a cada 1 minuto
    return () => clearInterval(interval);
  }, []);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="bg-sidebar px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-success font-display text-base font-bold text-success-foreground shadow-soft-md">
            A
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold text-sidebar-accent-foreground">
                ASPMM
              </span>
              <span className="text-[11px] font-medium text-sidebar-foreground/70">
                Painel Admin
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {items.map((item) => {
                const active =
                  item.url === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "h-10 rounded-lg px-3 text-sidebar-foreground transition-all duration-200",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        active &&
                          "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft-sm before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-sidebar-primary",
                      )}
                    >
                      <NavLink to={item.url} end={item.url === "/admin"}>
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sair"
              onClick={handleSignOut}
              className="h-10 rounded-lg px-3 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span className="text-sm font-medium">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
