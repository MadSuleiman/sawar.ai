"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type SupabaseContextType = {
  supabase: typeof supabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined,
);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        supabase: supabaseClient,
        user,
        session,
        isLoading,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}
