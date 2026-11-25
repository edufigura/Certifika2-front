"use client";
import { FormEvent, useState } from "react";
export default function CourseAnnouncementManager({ courseCode }: { courseCode: string }) {
  const [form, setForm] = useState({ titulo: "", contenido: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/bff/cursos/codigo/${encodeURIComponent(courseCode)}/anuncios`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setForm({ titulo: "", contenido: "" });
      setMessage("Anuncio publicado. Se notificará a los estudiantes inscritos mediante SQS.");
    } catch { setMessage("No se pudo publicar el anuncio. Intenta nuevamente."); }
    finally { setSaving(false); }
  }
  return <div className="material-manager"><strong>Anuncios e información</strong>
    <p>Una notificación para cada estudiante inscrito en este curso.</p>
    <form className="dashboard-form" onSubmit={publish}>
      <label>Título del anuncio<input required maxLength={180} value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} /></label>
      <label>Información o anuncio<textarea required maxLength={3000} rows={3} value={form.contenido} onChange={e => setForm({ ...form, contenido: e.target.value })} /></label>
      <button className="btn btn--primary btn--sm" disabled={saving}>{saving ? "Publicando…" : "Publicar y notificar"}</button>
    </form>{message && <p role="status">{message}</p>}</div>;
}
