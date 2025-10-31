"use client";

import { useSession as useBetterAuthSession } from "@/lib/auth-client";
import type { Session, User } from "better-auth";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

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
  const [lastKnownSession, setLastKnownSession] = useState<SessionData>(initialSession ?? null);

  const { data, isPending } = betterAuthSession;

  // Persist latest non-undefined session without touching refs during render
  useEffect(() => {
    if (data !== undefined) {
      setLastKnownSession(data);
    }
  }, [data]);

  const contextValue = useMemo(() => {
    const session = data !== undefined ? data : lastKnownSession;
    const pending = isPending && data === undefined;

    return { session, isPending: pending };
  }, [data, isPending, lastKnownSession]);

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