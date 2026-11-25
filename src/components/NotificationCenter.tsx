"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, GraduationCap } from "./icons";
import type { Notification } from "@/lib/notifications";
import styles from "./LearningWorkspace.module.css";

export default function NotificationCenter({ items, loading, error, onRead, onRefresh, onOpen }: {
  items: Notification[]; loading?: boolean; error?: string;
  onRead: (id: string) => Promise<void> | void;
  onRefresh?: () => Promise<void> | void;
  onOpen?: (item: Notification) => void;
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState("");
  const filtered = items.filter(item => (filter === "all" || filter === "unread" && !item.leida || filter === "material" && item.tipo === "MATERIAL") && `${item.titulo} ${item.contenido} ${item.codigoCurso}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")));
  const selected = filtered.find(item => item.id === selectedId) ?? filtered[0];
  const unread = items.filter(item => !item.leida).length;
  async function markRead(id: string) {
    setBusy(id); setFailure("");
    try { await onRead(id); }
    catch { setFailure("No se pudo marcar la notificación como leída. Vuelve a intentarlo."); }
    finally { setBusy(null); }
  }
  const kind = (item: Notification) => item.tipo === "MATERIAL" ? "Material nuevo" : item.tipo === "CERTIFICADO" ? "Certificación" : "Anuncio del curso";
  const date = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
  };
  return <div className={styles.inbox}>
    <div className={styles.inboxToolbar}><div><span className={styles.label}>CENTRO DE ACTIVIDAD</span><h2>Tu bandeja <span className={styles.count}>{unread}</span></h2></div>{onRefresh && <button className={styles.quietButton} onClick={async () => { setFailure(""); try { await onRefresh(); } catch { setFailure("No se pudo actualizar la bandeja."); } }}>Actualizar</button>}</div>
    <div className={styles.inboxControls}><div className={styles.filters} aria-label="Filtrar notificaciones">{[["all", "Todas"], ["unread", "Sin leer"], ["material", "Materiales"]].map(([id, title]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{title}{id === "unread" && <span>{unread}</span>}</button>)}</div><input className={styles.search} type="search" aria-label="Buscar notificaciones" placeholder="Buscar en tu bandeja…" value={query} onChange={event => setQuery(event.target.value)} /></div>
    {(error || failure) && <p className={styles.error} role="alert">{error || failure}</p>}
    {loading ? <div className={styles.inboxEmpty} role="status">Cargando novedades…</div> : !filtered.length ? <div className={styles.inboxEmpty}><Check size={30} /><h3>{items.length ? "Todo al día." : "Aquí empieza lo nuevo."}</h3><p>{query ? "No hay resultados para esa búsqueda." : "Las novedades de tus cursos aparecerán aquí."}</p></div> : <div className={styles.inboxLayout}>
      <div className={styles.messageList} aria-label="Notificaciones">{filtered.map(item => <button key={item.id} className={styles.messageRow} aria-pressed={selected.id === item.id} onClick={() => setSelectedId(item.id)}><span className={`${styles.messageIcon} ${item.leida ? styles.readIcon : ""}`}><GraduationCap size={19} /></span><span className={styles.messageSummary}><span className={styles.messageMeta}>{kind(item)} <time dateTime={item.fechaCreacion}>{date(item.fechaCreacion)}</time></span><strong>{item.titulo}</strong><small>{item.contenido}</small><span className={styles.courseTag}>{item.codigoCurso}</span></span>{!item.leida && <span className={styles.unreadDot} aria-label="Sin leer" />}</button>)}</div>
      <article className={styles.messageDetail} key={selected.id}><div className={styles.detailMeta}><span className={styles.pill}>{kind(selected)}</span><span>{selected.leida ? "Leída" : "Sin leer"}</span></div><h3>{selected.titulo}</h3><p className={styles.detailDate}>{date(selected.fechaCreacion)} · {selected.codigoCurso}</p><div className={styles.messageText}>{selected.contenido}</div><div className={styles.detailActions}>{onOpen ? <button className="btn btn--primary btn--sm" onClick={() => onOpen(selected)}>Ver contenido <ArrowRight size={15} /></button> : <Link className="btn btn--primary btn--sm" href={`/curso/?codigo=${encodeURIComponent(selected.codigoCurso)}`}>Abrir curso <ArrowRight size={15} /></Link>}{!selected.leida && <button className={styles.quietButton} disabled={busy !== null} onClick={() => void markRead(selected.id)}><Check size={14} />{busy === selected.id ? "Guardando…" : "Marcar como leída"}</button>}</div><p className={styles.detailFoot}>Tu aprendizaje, en movimiento.</p></article>
    </div>}
  </div>;
}
