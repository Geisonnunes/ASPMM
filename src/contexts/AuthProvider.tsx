import { useEffect, useState, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthContextType } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const mountedRef = useRef(true);

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

    if (!mountedRef.current) return;

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

    const { data: adminCheck } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!mountedRef.current) return;
    setIsAdmin(adminCheck === true);
  };

  useEffect(() => {
    mountedRef.current = true;

    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mountedRef.current) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      }

      if (mountedRef.current) setLoading(false);
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mountedRef.current) return;

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

    return () => {
      mountedRef.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setIsSigningOut(true);
    setMustChangePassword(false);
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    await supabase.auth.signOut();
    setIsSigningOut(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        mustChangePassword,
        isSigningOut,
        profile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
