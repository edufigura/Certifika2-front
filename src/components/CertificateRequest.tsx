"use client";

import Link from "next/link";
import { useState } from "react";
import { certificateRequest } from "@/lib/certificates";

export default function CertificateRequest({ code }: { code: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function request() {
    setBusy(true); setMessage("");
    try {
      await certificateRequest(`cursos/codigo/${encodeURIComponent(code)}/certificado?formato=PDF`, { method: "POST" });
      setMessage("Solicitud registrada. Tu certificado aparecerá en tu perfil cuando termine la emisión.");
      window.dispatchEvent(new Event("certifika2:certificates-change"));
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo solicitar el certificado."); }
    finally { setBusy(false); }
  }
  return <section className="card card-pad" style={{ marginTop: 20 }}>
    <h3>Tu certificado</h3><p className="section-subtitle">Solicítalo cuando tu profesor haya confirmado la finalización del curso.</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <button type="button" className="btn btn--primary btn--sm" disabled={busy} onClick={() => void request()}>{busy ? "Enviando…" : "Solicitar certificado PDF"}</button>
      <Link href="/perfil#certificados" className="section-link">Ver mis certificados →</Link>
    </div>
    {message && <p role="status" className="auth-note" style={{ marginTop: 12 }}>{message}</p>}
  </section>;
}
