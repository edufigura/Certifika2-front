"use client";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth";

export type Notification = {
  id: string; codigoCurso: string; tipo: string; titulo: string;
  contenido: string; fechaCreacion: string; leida: boolean;
};
type Inbox = { items: Notification[]; noLeidas: number };

export function useNotifications() {
  const { signedIn, user } = useSession();
  const [inbox, setInbox] = useState<Inbox>({ items: [], noLeidas: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!signedIn) return;
    try {
      const response = await fetch("/api/bff/chat/notificaciones", { credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setInbox(await response.json() as Inbox);
      setError("");
    } catch { setError("No se pudieron cargar las notificaciones. Intenta actualizar."); }
    finally { setLoading(false); }
  }, [signedIn]);
  useEffect(() => {
    setInbox({ items: [], noLeidas: 0 });
    if (!signedIn) { setLoading(false); return; }
    setLoading(true);
    void reload();
    const timer = window.setInterval(() => void reload(), 15000);
    window.addEventListener("certifika2-notifications", reload);
    return () => { window.clearInterval(timer); window.removeEventListener("certifika2-notifications", reload); };
  }, [signedIn, user?.id, reload]);
  async function markRead(id: string) {
    const response = await fetch(`/api/bff/chat/notificaciones/${encodeURIComponent(id)}/leida`, {
      method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}",
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(`No se pudo marcar como leída (HTTP ${response.status}). ${detail.error || ""}`);
    }
    window.dispatchEvent(new Event("certifika2-notifications"));
  }
  return { ...inbox, signedIn, loading, error, reload, markRead };
}
