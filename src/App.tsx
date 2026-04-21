import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthProvider";
import AdminRoute from "@/components/AdminRoute";
import MustChangePasswordGuard from "@/components/MustChangePasswordGuard";
import Index from "./pages/Index.tsx";
import Estrutura from "./pages/Estrutura.tsx";
import Eventos from "./pages/Eventos.tsx";
import Regulamento from "./pages/Regulamento.tsx";
import Contato from "./pages/Contato.tsx";
import Login from "./pages/Login.tsx";
import Cadastro from "./pages/Cadastro.tsx";
import TrocarSenha from "./pages/TrocarSenha.tsx";
import Reservas from "./pages/Reservas.tsx";
import Galeria from "./pages/Galeria.tsx";
import Admin from "./pages/Admin.tsx";
import AdminContent from "./pages/AdminContent.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          {/*
            MustChangePasswordGuard envolve todas as rotas:
            se o usuário logado tiver must_change_password = true,
            é redirecionado para /trocar-senha automaticamente.
          */}
          <MustChangePasswordGuard>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/estrutura" element={<Estrutura />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/regulamento" element={<Regulamento />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/login" element={<Login />} />
              <Route path="/trocar-senha" element={<TrocarSenha />} />
              <Route
                path="/cadastro"
                element={
                  <AdminRoute>
                    <Cadastro />
                  </AdminRoute>
                }
              />
              <Route path="/reservas" element={<Reservas />} />
              <Route path="/galeria" element={<Galeria />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/conteudo" element={<AdminContent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MustChangePasswordGuard>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
