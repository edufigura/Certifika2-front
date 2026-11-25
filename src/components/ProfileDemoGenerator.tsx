"use client";

import { useEffect, useState } from "react";
import { certificateRequest } from "@/lib/certificates";

type Progress = { codigo: string; nombreCurso: string; nota: number; estado: string };
export default function ProfileDemoGenerator() {
  const [items, setItems] = useState<Progress[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { void certificateRequest<Progress[]>("cursos/demo/avance").then(setItems).catch(() => {}); }, []);
  async function generate() {
    setBusy(true); setMessage("");
    try {
      setItems(await certificateRequest<Progress[]>("cursos/demo/completar", { method: "POST" }));
      setMessage("Cursos completados y notas de ejemplo generados. Los certificados se están procesando por Kinesis y aparecerán abajo para descargar.");
      window.dispatchEvent(new Event("certifika2:certificates-change"));
      window.dispatchEvent(new Event("certifika2:enrollments-change"));
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo generar la demostración."); }
    finally { setBusy(false); }
  }
  return <section className="card card-pad">
    <div className="section-head-inline"><h2>Demostración de certificados</h2>
      <button className="btn btn--secondary btn--sm" disabled={busy} onClick={() => void generate()}>{busy ? "Generando…" : "DEMO"}</button></div>
    <p className="page-subtitle">Genera notas de ejemplo y completa los cursos del catálogo en los que ya estás inscrito. Disponible para cualquier rol; los certificados DEMO utilizan el flujo real de emisión por Kinesis.</p>
    {items.map(item => <p key={item.codigo}><strong>{item.nombreCurso}</strong> · Completado · Nota: {item.nota.toFixed(1)}</p>)}
    {message && <p role="status" className="auth-note">{message}</p>}
  </section>;
}
