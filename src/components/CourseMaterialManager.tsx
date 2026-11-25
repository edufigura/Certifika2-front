"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { CourseMaterial } from "@/components/CourseMaterials";

const EMPTY = { titulo: "", tipo: "PDF", url: "" };

export default function CourseMaterialManager({ courseCode }: { courseCode: string }) {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    fetch(`/api/bff/cursos/codigo/${encodeURIComponent(courseCode)}/materiales`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((response) => response.ok ? response.json() as Promise<CourseMaterial[]> : Promise.reject())
      .then(setMaterials)
      .catch(() => setMessage("No se pudo cargar el material."));
  }, [courseCode]);

  useEffect(load, [load]);

  async function addMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/bff/cursos/codigo/${encodeURIComponent(courseCode)}/materiales`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const created = (await response.json()) as CourseMaterial;
      setMaterials((current) => [...current, created]);
      setForm(EMPTY);
      setMessage("Material publicado. Se notificará a los estudiantes inscritos mediante SQS.");
    } catch (error) {
      setMessage(`No se pudo publicar (${error instanceof Error ? error.message : "error"}).`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="material-manager">
      <strong>Material complementario</strong>
      {materials.length ? <ul>{materials.map((item) => <li key={item.idMaterial}>{item.tipo}: {item.titulo}</li>)}</ul> : <p>Sin material publicado.</p>}
      <form className="material-form" onSubmit={addMaterial}>
        <label>Título del recurso<input required placeholder="Nombre del material" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></label>
        <label>Tipo de material<select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
          <option>PDF</option><option>Video</option><option>Guía</option><option>Repositorio</option><option>Enlace</option>
        </select></label>
        <label>Enlace al material<input required type="url" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></label>
        <button className="btn btn--secondary btn--sm" type="submit" disabled={saving}>{saving ? "Publicando…" : "Agregar material"}</button>
      </form>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
