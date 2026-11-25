"use client";

import { useEffect, useState } from "react";

export type SessionUser = {
  id: string;
  name: string;
  givenName?: string;
  email: string;
  emailVerified: boolean;
  picture?: string;
  groups: string[];
};

export type Session = {
  signedIn: boolean;
  user: SessionUser | null;
  /** Vencimiento del JWT de sesión, en segundos epoch. */
  expiresAt: number | null;
  /** False cuando falta la configuración del cliente BFF de Cognito. */
  configured: boolean;
};

const EMPTY_SESSION: Session = {
  signedIn: false,
  user: null,
  expiresAt: null,
  configured: false,
};

let cache: Session | null = null;
const listeners = new Set<() => void>();

function bffUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BFF_BASE_URL?.trim().replace(/\/$/, "") ?? "";
  return `${base}${path}`;
}

function emit() {
  listeners.forEach((callback) => callback());
}

async function fetchSession(): Promise<Session> {
  try {
    const response = await fetch(bffUrl("/api/auth/session"), {
      cache: "no-store",
      credentials: "include",
    });
    if (!response.ok) return EMPTY_SESSION;
    return (await response.json()) as Session;
  } catch {
    return EMPTY_SESSION;
  }
}

/** Inicia Cognito OIDC en el BFF; el navegador nunca recibe los tokens. */
export function signInWithCognito() {
  window.location.href = bffUrl("/api/auth/cognito");
}

export async function signOut() {
  const response = await fetch(bffUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
  });
  const result = response.ok
    ? ((await response.json()) as { logoutUrl?: string })
    : {};
  cache = EMPTY_SESSION;
  emit();
  if (result.logoutUrl) window.location.href = result.logoutUrl;
}

export function useSession(): Session & { loading: boolean } {
  const [session, setSession] = useState<Session | null>(cache);

  useEffect(() => {
    let active = true;

    const sync = () => {
      if (active) setSession(cache);
    };
    listeners.add(sync);

    if (cache === null) {
      fetchSession().then((next) => {
        cache = next;
        emit();
      });
    } else {
      sync();
    }

    return () => {
      active = false;
      listeners.delete(sync);
    };
  }, []);

  return {
    ...(session ?? EMPTY_SESSION),
    loading: session === null,
  };
}

export function useSignedIn(): boolean {
  return useSession().signedIn;
}
