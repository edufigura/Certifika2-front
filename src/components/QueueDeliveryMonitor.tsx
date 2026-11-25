"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/auth";
import { deliveryState, type DeliveryEvent, type DeliveryReceipt } from "@/lib/deliveryStatus";
import styles from "./QueueDeliveryMonitor.module.css";

type Depth = { state: "AVAILABLE" | "UNAVAILABLE" | "NOT_CONFIGURED"; ready: number | null; inFlight: number | null; delayed: number | null };
type ProducerReport = { observedAt: string; queue: string; pending: number; accepted: number; events: DeliveryEvent[]; sqs: { main: Depth; dlq: Depth } };
type ConsumerReport = { observedAt: string; events: DeliveryReceipt[] };

export default function QueueDeliveryMonitor() {
  const { signedIn, user } = useSession();
  const enabled = signedIn && Boolean(user?.groups.includes("ADMIN"));
  const [report, setReport] = useState<ProducerReport | null>(null);
  const [receipts, setReceipts] = useState<ConsumerReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consumerError, setConsumerError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (!enabled || inFlight.current) return;
    inFlight.current = true;
    const request = new AbortController();
    controller.current = request;
    setLoading(true);
    const timeout = setTimeout(() => request.abort(), 25000);
    try {
      const response = await fetch("/api/bff/cursos/admin/entregas", { credentials: "include", cache: "no-store", signal: request.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const next = await response.json() as ProducerReport;
      if (!Array.isArray(next.events) || !next.sqs) throw new Error("Invalid report");
      setReport(next); setError("");
      setReceipts(null);
      try {
        const consumer = await fetch("/api/bff/chat/admin/entregas/consulta", {
          method: "POST", credentials: "include", cache: "no-store", signal: request.signal,
          headers: { "Content-Type": "application/json" }, body: JSON.stringify(next.events.map(event => event.id)),
        });
        if (!consumer.ok) throw new Error();
        const result = await consumer.json() as ConsumerReport;
        if (!Array.isArray(result.events)) throw new Error();
        setReceipts(result); setConsumerError("");
      } catch {
        if (!request.signal.aborted) setConsumerError("No se pudo consultar al consumidor. La recepción y las lecturas no están confirmadas.");
      }
    } catch {
      if (!request.signal.aborted) setError("No se pudo consultar el monitor. Si hay datos visibles, corresponden a la última consulta exitosa.");
      else if (controller.current === request) setError("La consulta no terminó. Actualiza para volver a intentar.");
    } finally {
      clearTimeout(timeout);
      if (controller.current === request) { inFlight.current = false; setLoading(false); }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) { setReport(null); setReceipts(null); return; }
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => { clearInterval(timer); controller.current?.abort(); controller.current = null; inFlight.current = false; };
  }, [enabled, load]);

  const receiptsById = new Map(receipts?.events.map(receipt => [receipt.id, receipt]));
  const rows = report?.events.filter(event => (filter === "all" || deliveryState(event, receiptsById.get(event.id)).key === filter) && `${event.id} ${event.title} ${event.courseCode}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es"))) ?? [];
  const date = (value?: string | null) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleString("es-CL") : "No disponible";
  const metric = (depth?: Depth, name: "ready" | "inFlight" | "delayed" = "ready") => depth?.state === "AVAILABLE" ? depth[name] ?? "—" : "—";

  return <section className={styles.monitor} aria-labelledby="queue-monitor-title">
    <header className={styles.header}><div><p>TRAZABILIDAD DE MENSAJES</p><h2 id="queue-monitor-title">Colas y entregas</h2><span>Publicación, procesamiento y lectura de anuncios y materiales.</span></div><button className="btn btn--secondary btn--sm" disabled={!enabled || loading} onClick={() => void load()}>{loading ? "Consultando…" : "Actualizar estado"}</button></header>
    {!enabled && <div className={styles.notice}>Inicia sesión como administrador para consultar los registros reales. Esta vista no carga mensajes de ejemplo.</div>}
    {error && <p className={styles.warning} role="alert">{error}</p>}
    {consumerError && <p className={styles.warning} role="alert">{consumerError}</p>}
    <div className={styles.flow} aria-label="Etapas de entrega"><span>Registrado en el curso</span><span aria-hidden="true">→</span><span>Aceptado por SQS</span><span aria-hidden="true">→</span><span>Procesado</span><span aria-hidden="true">→</span><span>Leído por estudiante</span></div>
    <div className={styles.metrics}>
      <div><span>Pendientes de envío</span><strong>{report?.pending ?? "—"}</strong><small>Registro persistente del productor</small></div>
      <div><span>Mensajes disponibles</span><strong>{metric(report?.sqs.main)}</strong><small>SQS · Recuento aproximado</small></div>
      <div><span>En procesamiento</span><strong>{metric(report?.sqs.main, "inFlight")}</strong><small>SQS · Mensajes no visibles</small></div>
      <div><span>En la cola de errores</span><strong>{metric(report?.sqs.dlq)}</strong><small>{report?.sqs.dlq.state === "NOT_CONFIGURED" ? "DLQ no configurada" : "DLQ · Recuento aproximado"}</small></div>
    </div>
    <div className={styles.sourceStatus}><span>{report ? `Cola: ${report.queue}` : "Sin consulta confirmada"}</span><span>{report ? `Productor: ${date(report.observedAt)}` : ""}</span><span>{receipts ? `Consumidor: ${date(receipts.observedAt)}` : enabled ? "Consumidor sin confirmación" : ""}</span></div>
    {report?.sqs.main.state === "UNAVAILABLE" && <p className={styles.notice}>Los atributos de SQS no están disponibles. Los registros de envío y recepción se muestran por separado.</p>}
    {report?.sqs.dlq.state === "UNAVAILABLE" && <p className={styles.notice}>No se pudo consultar la DLQ. Esto no significa que esté vacía.</p>}
    <div className={styles.toolbar}><div aria-label="Filtrar entregas">{[["all", "Todos"], ["pending", "Pendientes"], ["accepted", "Aceptados por SQS"], ["processed", "Procesados"]].map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div><input type="search" aria-label="Buscar eventos de cola" placeholder="Buscar curso, mensaje o ID…" value={query} onChange={event => setQuery(event.target.value)} /></div>
    <div className={styles.tableWrap}><table><thead><tr><th>Evento / curso</th><th>Última etapa confirmada</th><th>Bandejas creadas</th><th>Leídas</th><th>Intentos de envío</th></tr></thead><tbody>{rows.map(event => {
      const receipt = receiptsById.get(event.id);
      const state = deliveryState(event, receipt);
      return <tr key={event.id}><td><button className={styles.eventButton} onClick={() => setSelected(selected === event.id ? null : event.id)} aria-expanded={selected === event.id}><strong>{event.title}</strong><span>{event.courseCode || "Curso no disponible"}</span><code>{event.id}</code></button>{selected === event.id && <div className={styles.eventDetail}><p>Aceptación por SQS: {event.acceptedBySqs ? "Confirmada por el productor" : "Sin confirmación"}</p><p>Procesamiento: {receipt ? receipt.processed ? "Confirmado y guardado" : "Sin confirmación registrada" : "Consulta no disponible"}</p><p>Próximo intento: {event.acceptedBySqs ? "No corresponde" : date(event.nextAttemptAt)}</p><p>Fecha del evento: {event.createdAt || "No disponible"}</p><p>Tipo: {event.type}</p></div>}</td><td><span className={styles.status} data-stage={state.key}>{state.label}</span>{event.acceptedBySqs && !receipt?.processed && <small className={styles.noReceipt}>Recepción no confirmada</small>}</td><td>{receipt ? receipt.delivered : "—"} / {event.expectedRecipients ?? "—"}</td><td>{receipt ? receipt.readCount : "—"}</td><td>{event.attempts}</td></tr>;
    })}</tbody></table>{!rows.length && <div className={styles.empty}>{loading ? "Consultando los registros…" : !report ? "Sin datos confirmados para mostrar." : query || filter !== "all" ? "No hay eventos para este filtro." : "El productor no tiene eventos registrados."}</div>}</div>
    <footer className={styles.footer}>Hasta 200 eventos observados · Actualización cada 15 segundos con sesión de administrador. “Aceptado por SQS” no confirma el procesamiento; “leído” requiere el registro del estudiante. Las cifras de SQS son aproximadas. Esta vista no consume, elimina ni reenvía mensajes.</footer>
  </section>;
}
