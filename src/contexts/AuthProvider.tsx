import { useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthContextType } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, cpf, membership_status, must_change_password")
      .eq("id", userId)
      .single<{
        full_name: string | null;
        phone: string | null;
        cpf: string | null;
        membership_status: string | null;
        must_change_password: boolean | null;
      }>();

    console.log("[AuthProvider] fetchProfile data:", data, "error:", error);

    if (!error && data) {
      setProfile({
        full_name: data.full_name ?? "",
        phone: data.phone,
        cpf: data.cpf,
        membership_status: data.membership_status ?? "ativo",
        must_change_password: data.must_change_password ?? false,
      });
      setMustChangePassword(data.must_change_password === true);
    }

    // Verifica admin via função SECURITY DEFINER (evita loop de RLS)
    const { data: adminCheck } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    setIsAdmin(adminCheck === true);
    console.log(
      "[AuthProvider] isAdmin:",
      adminCheck,
      "mustChangePassword:",
      mustChangePassword,
    );
  };

  useEffect(() => {
    let mounted = true;

    // 1. Carrega sessão já existente (ex: refresh de página)
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      }

      setLoading(false);
    };

    initSession();

    // 2. Escuta mudanças de auth (login, logout)
    // IMPORTANTE: callback NÃO pode ser async — chamamos fetchProfile sem await
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Chama sem await — o estado é atualizado de forma assíncrona
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setMustChangePassword(false);
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setMustChangePassword(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        mustChangePassword,
        profile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
