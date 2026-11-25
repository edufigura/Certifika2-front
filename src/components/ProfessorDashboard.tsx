"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import RoleGate from "@/components/RoleGate";
import CourseMaterialManager from "@/components/CourseMaterialManager";
import CourseAnnouncementManager from "@/components/CourseAnnouncementManager";

type ManagedCourse = {
  idCurso: number;
  codigo: string;
  nombreCurso: string;
  nivelCurso?: string;
  descripcion?: string;
};

const EMPTY_FORM = { codigo: "", nombreCurso: "", nivelCurso: "Básico", descripcion: "" };

function ProfessorWorkspace() {
  const [courses, setCourses] = useState<ManagedCourse[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadCourses = useCallback(async () => {
    const response = await fetch("/api/bff/cursos/profesor/mis-cursos", {
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    setCourses((await response.json()) as ManagedCourse[]);
  }, []);

  useEffect(() => {
    loadCourses()
      .catch(() => setMessage("No se pudieron cargar tus cursos."))
      .finally(() => setLoading(false));
  }, [loadCourses]);

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/bff/cursos", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const created = (await response.json()) as ManagedCourse;
      setCourses((current) => [...current, created]);
      setForm(EMPTY_FORM);
      setMessage("Tu curso ya está creado. Ahora puedes compartir materiales y anuncios.");
    } catch (error) {
      const status = error instanceof Error ? error.message : "error";
      setMessage(`No se pudo crear el curso (${status}).`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container dashboard-grid">
      <section className="card card-pad">
        <h2 className="section-title">Crear curso</h2>
        <p className="section-subtitle">Convierte lo que sabes en una nueva oportunidad para aprender.</p>
        <form className="dashboard-form" onSubmit={createCourse}>
          <label>Código del curso
            <input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="ejemplo-cloud-native" value={form.codigo}
              onChange={(event) => setForm({ ...form, codigo: event.target.value.toLowerCase() })} />
          </label>
          <label>Nombre
            <input required value={form.nombreCurso}
              onChange={(event) => setForm({ ...form, nombreCurso: event.target.value })} />
          </label>
          <label>Nivel
            <select value={form.nivelCurso}
              onChange={(event) => setForm({ ...form, nivelCurso: event.target.value })}>
              <option>Básico</option><option>Intermedio</option><option>Avanzado</option>
            </select>
          </label>
          <label>Descripción
            <textarea required rows={4} value={form.descripcion}
              onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
          </label>
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Crear curso"}
          </button>
        </form>
        {message ? <p className="auth-alert dashboard-alert">{message}</p> : null}
      </section>

      <section className="card card-pad">
        <div className="section-head-inline">
          <h2>Mis cursos creados</h2>
          <span className="metric-value metric-value--small">{courses.length}</span>
        </div>
        {loading ? <p className="section-subtitle">Cargando…</p> : courses.length ? (
          <div className="dashboard-list">
            {courses.map((course) => (
              <article key={course.idCurso}>
                <strong>{course.nombreCurso}</strong>
                <span>{course.codigo} · {course.nivelCurso || "Sin nivel"}</span>
                {course.descripcion ? <p>{course.descripcion}</p> : null}
                <CourseMaterialManager courseCode={course.codigo} />
                <CourseAnnouncementManager courseCode={course.codigo} />
              </article>
            ))}
          </div>
        ) : <p className="section-subtitle">Todavía no has creado cursos.</p>}
      </section>
    </div>
  );
}

export default function ProfessorDashboard() {
  return <RoleGate roles={["PROFESOR", "ADMIN"]}><ProfessorWorkspace /></RoleGate>;
}
