import "server-only";

import { randomBytes } from "node:crypto";

export type SessionUser = {
  id: string;
  name: string;
  givenName?: string;
  email: string;
  emailVerified: boolean;
  picture?: string;
  groups: string[];
};

export type ServerSession = {
  user: SessionUser;
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt: number;
  sessionExpiresAt: number;
};

type GlobalWithSessions = typeof globalThis & {
  __certifika2Sessions?: Map<string, ServerSession>;
};

const globalWithSessions = globalThis as GlobalWithSessions;
const sessions =
  globalWithSessions.__certifika2Sessions ?? new Map<string, ServerSession>();

globalWithSessions.__certifika2Sessions = sessions;

export function createServerSession(session: ServerSession): string {
  const sessionId = randomBytes(32).toString("base64url");
  sessions.set(sessionId, session);
  return sessionId;
}

export function readServerSession(sessionId: string | undefined): ServerSession | null {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.sessionExpiresAt <= Math.floor(Date.now() / 1000)) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

export function updateServerSession(sessionId: string, session: ServerSession): void {
  sessions.set(sessionId, session);
}

export function deleteServerSession(sessionId: string | undefined): void {
  if (sessionId) sessions.delete(sessionId);
}
