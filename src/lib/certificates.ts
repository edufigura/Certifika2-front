"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "./auth";

export type Certificate = {
  idCertificado: number; codigoVerificacion: string; nombreCurso: string;
  nombreTitular: string; nivelCurso: string; formato: string; fechaEmision: string;
};

export async function certificateRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/bff/${path}`, { credentials: "include", cache: "no-store", ...options });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({})) as { message?: string; error?: string };
    throw new Error(response.status === 409
      ? "Revisa que estés inscrito y que tu profesor haya registrado la finalización del curso."
      : detail.message || `No se pudo completar la operación (HTTP ${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export function useCertificates() {
  const { signedIn, loading: sessionLoading } = useSession();
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const reload = useCallback(async () => {
    if (!signedIn) { setItems([]); setLoading(false); return; }
    try { setItems(await certificateRequest<Certificate[]>("certificados")); setFailed(false); }
    catch { setFailed(true); }
    finally { setLoading(false); }
  }, [signedIn]);
  useEffect(() => {
    if (sessionLoading) return;
    void reload();
    const refresh = () => { if (document.visibilityState === "visible") void reload(); };
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    window.addEventListener("certifika2:certificates-change", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); window.removeEventListener("certifika2:certificates-change", refresh); };
  }, [sessionLoading, reload]);
  return { items, loading: loading || sessionLoading, failed, reload };
}
