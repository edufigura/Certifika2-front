import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/cognito";
import {
  readServerSession,
  type ServerSession,
  type SessionUser,
} from "@/lib/session-store";

export type SessionInfo = {
  user: SessionUser;
  expiresAt: number;
};

export async function getSessionWithId(): Promise<{
  sessionId: string;
  session: ServerSession;
} | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  const session = readServerSession(sessionId);
  return session && sessionId ? { sessionId, session } : null;
}

/** Sesión actual (JWT verificado) para usar en Server Components y handlers. */
export async function getSession(): Promise<SessionInfo | null> {
  const current = await getSessionWithId();
  if (current) {
    return {
      user: current.session.user,
      expiresAt: current.session.sessionExpiresAt,
    };
  }

  return null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return (await getSession())?.user ?? null;
}
