import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthProvider";
import AdminRoute from "@/components/AdminRoute";
import MustChangePasswordGuard from "@/components/MustChangePasswordGuard";
import { AdminLayout } from "@/components/admin-layout/AdminLayout";

// Páginas públicas
import Index from "./pages/Index.tsx";
import Estrutura from "./pages/Estrutura.tsx";
import Eventos from "./pages/Eventos.tsx";
import Informacoes from "./pages/Informacoes.tsx";
import Contato from "./pages/Contato.tsx";
import Login from "./pages/Login.tsx";
import Cadastro from "./pages/Cadastro.tsx";
import TrocarSenha from "./pages/TrocarSenha.tsx";
import Galeria from "./pages/Galeria.tsx";
import NotFound from "./pages/NotFound.tsx";

// Páginas do painel admin
import Dashboard from "./pages/admin/Dashboard.tsx";
import Usuarios from "./pages/admin/Usuarios.tsx";
import EventosAdmin from "./pages/admin/Eventos.tsx";
import GaleriaAdmin from "./pages/admin/Galeria.tsx";
import Mensagens from "./pages/admin/Mensagens.tsx";
import Conteudo from "./pages/admin/Conteudo.tsx";
import InformacoesAdmin from "./pages/admin/Informacoes.tsx";
import Espacos from "./pages/admin/Espacos.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MustChangePasswordGuard>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/estrutura" element={<Estrutura />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/informacoes" element={<Informacoes />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/login" element={<Login />} />
              <Route path="/trocar-senha" element={<TrocarSenha />} />
              <Route path="/galeria" element={<Galeria />} />
              <Route
                path="/cadastro"
                element={
                  <AdminRoute>
                    <Cadastro />
                  </AdminRoute>
                }
              />

              {/* Painel Admin — layout próprio com sidebar */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="eventos" element={<EventosAdmin />} />
                <Route path="espacos" element={<Espacos />} />
                <Route path="galeria" element={<GaleriaAdmin />} />
                <Route path="mensagens" element={<Mensagens />} />
                <Route path="conteudo" element={<Conteudo />} />
                <Route path="informacoes" element={<InformacoesAdmin />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </MustChangePasswordGuard>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
