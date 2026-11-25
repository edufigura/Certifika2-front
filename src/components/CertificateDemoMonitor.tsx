"use client";

import { useCallback, useEffect, useState } from "react";
import { certificateRequest } from "@/lib/certificates";
import styles from "./QueueDeliveryMonitor.module.css";

type Grade = { codigo: string; nombreCurso: string; nota: number; eventId: string; idUsuario: string; fechaDemo: string };
type Sent = { eventId: string; aceptadoKinesis: string | null; ultimoError: string | null };
type Receipt = { eventId: string; emitidoEn: string };

export default function CertificateDemoMonitor() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sent, setSent] = useState<Sent[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextGrades, nextSent, nextReceipts] = await Promise.all([
        certificateRequest<Grade[]>("cursos/demo/admin"),
        certificateRequest<Sent[]>("cursos/admin/certificados"),
        certificateRequest<{ emitidos: Receipt[] }>("certificados/admin/entregas"),
      ]);
      setGrades(nextGrades); setSent(nextSent); setReceipts(nextReceipts.emitidos); setError("");
    } catch { setError("No se pudo actualizar el visor. Los datos visibles corresponden a la última consulta correcta."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 15000);
    return () => window.clearInterval(timer);
  }, [load]);
  const deliveries = new Map(sent.map(item => [item.eventId, item]));
  const emitted = new Map(receipts.map(item => [item.eventId, item]));
  const rows = grades.filter(item => `${item.nombreCurso} ${item.codigo} ${item.idUsuario}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")));
  return <section className={styles.monitor} aria-labelledby="certificate-monitor-title">
    <header className={styles.header}><div><p>NOTAS Y CERTIFICADOS</p><h2 id="certificate-monitor-title">Visor de demostraciones · Kinesis</h2><span>Notas de ejemplo sobre cursos inscritos y estado real de emisión del PDF.</span></div>
      <button className="btn btn--secondary btn--sm" disabled={loading} onClick={() => void load()}>{loading ? "Actualizando…" : "Actualizar certificados"}</button></header>
    <div className={styles.flow}><span>Curso inscrito</span><span aria-hidden="true">→</span><span>Nota DEMO y finalización</span><span aria-hidden="true">→</span><span>Kinesis</span><span aria-hidden="true">→</span><span>Certificado PDF</span></div>
    {error && <p role="alert" className={styles.warning}>{error}</p>}
    <div className={styles.metrics}>
      <div><span>Notas DEMO</span><strong>{grades.length}</strong><small>Últimos 200 registros</small></div>
      <div><span>Aceptados por Kinesis</span><strong>{grades.filter(item => deliveries.get(item.eventId)?.aceptadoKinesis).length}</strong><small>Confirmación del productor</small></div>
      <div><span>PDF emitidos</span><strong>{grades.filter(item => emitted.has(item.eventId)).length}</strong><small>Confirmación del consumidor</small></div>
    </div>
    <div className={styles.toolbar}><input type="search" aria-label="Buscar notas por curso o usuario" placeholder="Buscar curso o usuario…" value={query} onChange={event => setQuery(event.target.value)} /></div>
    <div className={styles.tableWrap}><table><thead><tr><th>Curso</th><th>Usuario</th><th>Nota DEMO</th><th>Estado confirmado</th><th>Evento</th></tr></thead><tbody>{rows.map(item => {
      const producer = deliveries.get(item.eventId); const receipt = emitted.get(item.eventId);
      return <tr key={item.eventId}><td><strong>{item.nombreCurso}</strong><div>{item.codigo}</div></td><td><code>{item.idUsuario}</code></td><td>{item.nota.toFixed(1)} / 7.0</td>
        <td>{receipt ? "PDF emitido" : producer?.aceptadoKinesis ? "Aceptado por Kinesis" : "Pendiente de envío"}{producer?.ultimoError && !producer.aceptadoKinesis && <div>Reintentando envío</div>}</td><td><code>{item.eventId}</code><div>{new Date(receipt?.emitidoEn || item.fechaDemo).toLocaleString("es-CL")}</div></td></tr>;
    })}</tbody></table>{!rows.length && <p className={styles.empty}>{loading ? "Consultando…" : "Sin notas DEMO para mostrar. Genera una demostración desde un perfil inscrito en cursos."}</p>}</div>
    <footer className={styles.footer}>Actualización cada 15 segundos. Las notas son sintéticas; el envío a Kinesis y la emisión se confirman con registros del backend. El titular descarga sus documentos desde su perfil.</footer>
  </section>;
}
