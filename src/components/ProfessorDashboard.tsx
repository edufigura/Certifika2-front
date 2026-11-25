"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import RoleGate from "@/components/RoleGate";
import CourseMaterialManager from "@/components/CourseMaterialManager";
import CourseAnnouncementManager from "@/components/CourseAnnouncementManager";
import CourseStudents from "@/components/CourseStudents";
import styles from "./ProfessorDashboard.module.css";

type ManagedCourse = {
  idCurso: number;
  codigo: string;
  nombreCurso: string;
  nivelCurso?: string;
  descripcion?: string;
};

const EMPTY_FORM = { codigo: "", nombreCurso: "", nivelCurso: "Básico", descripcion: "" };

function ProfessorWorkspace() {
  const [view, setView] = useState<"courses" | "create">("courses");
  const [selected, setSelected] = useState<number | null>(null);
  const [tool, setTool] = useState("students");
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
      setSelected(created.idCurso); setView("courses");
      setMessage("Tu curso ya está creado. Ahora puedes compartir materiales y anuncios.");
    } catch (error) {
      const status = error instanceof Error ? error.message : "error";
      setMessage(`No se pudo crear el curso (${status}).`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`container ${styles.workspace}`}>
      <nav className={styles.tabs} aria-label="Espacio docente"><button aria-pressed={view === "courses"} onClick={() => setView("courses")}>Mis cursos <span>{courses.length}</span></button><button aria-pressed={view === "create"} onClick={() => setView("create")}>+ Crear curso</button></nav>
      {view === "create" && (
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

      )}
      {view === "courses" && <section className="card card-pad">
        <div className="section-head-inline">
          <h2>Mis cursos creados</h2>
          <span className="metric-value metric-value--small">{courses.length}</span>
        </div>
        {loading ? <p className="section-subtitle">Cargando…</p> : courses.length ? (
          <div className={styles.courseGrid}>
            {courses.map((course) => (
              <article key={course.idCurso} className={styles.course} data-selected={selected === course.idCurso}>
                <strong>{course.nombreCurso}</strong>
                <span>{course.codigo} · {course.nivelCurso || "Sin nivel"}</span>
                {course.descripcion ? <p>{course.descripcion}</p> : null}
                <button className="btn btn--secondary btn--sm" onClick={() => { setSelected(course.idCurso); setTool("students"); }}>Gestionar curso →</button>
              </article>
            ))}
          </div>
        ) : <p className="section-subtitle">Todavía no has creado cursos.</p>}
      </section>}
      {view === "courses" && message && <p role="status" className="auth-note">{message}</p>}
      {view === "courses" && courses.filter(course => course.idCurso === selected).map(course => <section key={course.idCurso} className="card card-pad">
        <div className="section-head-inline"><div><p className="eyebrow">GESTIÓN DEL CURSO</p><h2>{course.nombreCurso}</h2></div><button className="btn btn--secondary btn--sm" onClick={() => setSelected(null)}>Cerrar</button></div>
        <nav className={styles.tabs} aria-label="Herramientas del curso">{[["students", "Estudiantes"], ["materials", "Materiales"], ["announcements", "Anuncios"]].map(([id, label]) => <button key={id} aria-pressed={tool === id} onClick={() => setTool(id)}>{label}</button>)}</nav>
        {tool === "students" && <CourseStudents courseCode={course.codigo} />}{tool === "materials" && <CourseMaterialManager courseCode={course.codigo} />}{tool === "announcements" && <CourseAnnouncementManager courseCode={course.codigo} />}
      </section>)}
    </div>
  );
}

export default function ProfessorDashboard() {
  return <RoleGate roles={["PROFESOR", "ADMIN"]}><ProfessorWorkspace /></RoleGate>;
}
