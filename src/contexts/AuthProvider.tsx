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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setMustChangePassword(false);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "full_name, phone, cpf, membership_status, is_admin, must_change_password",
      )
      .eq("id", userId)
      .single<{
        full_name: string | null;
        phone: string | null;
        cpf: string | null;
        membership_status: string | null;
        is_admin: boolean | null;
        must_change_password: boolean | null;
      }>();

    if (!error && data) {
      setProfile({
        full_name: data.full_name ?? "",
        phone: data.phone,
        cpf: data.cpf,
        membership_status: data.membership_status ?? "ativo",
        must_change_password: data.must_change_password ?? false,
      });
      setIsAdmin(data.is_admin === true);
      setMustChangePassword(data.must_change_password === true);
    }
  };

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
