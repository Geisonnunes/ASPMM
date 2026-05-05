import { createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  mustChangePassword: boolean;
  isSigningOut: boolean;
  profile: {
    full_name: string;
    phone: string | null;
    cpf: string | null;
    membership_status: string;
    must_change_password: boolean;
  } | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const useAuth = () => useContext(AuthContext);
