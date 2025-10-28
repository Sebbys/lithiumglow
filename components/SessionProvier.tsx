"use client";

import { useSession as useBetterAuthSession } from "@/lib/auth-client";
import type { Session, User } from "better-auth";
import { ReactNode, createContext, useContext, useMemo, useRef } from "react";

type SessionData = {
  user: User;
  session: Session;
} | null;

interface SessionContextType {
  session: SessionData;
  isPending: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
  initialSession?: SessionData;
}

export function SessionProvider({ children, initialSession }: SessionProviderProps) {
  const betterAuthSession = useBetterAuthSession();
  const lastKnownSessionRef = useRef<SessionData>(initialSession ?? null);

  const { data, isPending } = betterAuthSession;

  if (data !== undefined) {
    lastKnownSessionRef.current = data;
  }

  const contextValue = useMemo(() => {
    const session = data !== undefined ? data : lastKnownSessionRef.current;
    const pending = isPending && data === undefined;

    return { session, isPending: pending };
  }, [data, isPending]);

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}