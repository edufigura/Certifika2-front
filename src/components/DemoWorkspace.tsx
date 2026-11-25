"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import ProfileCertificates from "./ProfileCertificates";
import QueueDeliveryMonitor from "./QueueDeliveryMonitor";
import CourseClassroom from "./CourseClassroom";
import NotificationCenter from "./NotificationCenter";
import AreaArtwork from "@/components/AreaArtwork";
import { ArrowRight } from "@/components/icons";
import { COURSES } from "@/lib/data";
import styles from "./DemoWorkspace.module.css";

const sections = [
  { id: "courses", label: "Mis cursos", role: "Estudiante", title: "Tu próximo paso empieza aquí.", description: "Cursos inscritos y avances de ejemplo." },
  { id: "profile", label: "Mi perfil", role: "Estudiante", title: "Tu recorrido, en un lugar.", description: "Identidad y recorrido de aprendizaje." },
  { id: "classroom", label: "Aula del curso", role: "Estudiante", title: "Haz espacio para aprender.", description: "Una muestra del recorrido dentro de un curso." },
  { id: "notifications", label: "Notificaciones", role: "Estudiante", title: "Conecta con lo nuevo.", description: "Prueba cómo se ven y se marcan las novedades." },
  { id: "teacher", label: "Espacio docente", role: "Profesor", title: "Comparte lo que sabes.", description: "Simula la creación de un curso y revisa sus materiales." },
  { id: "admin", label: "Administración", role: "Administrador", title: "Detrás de cada comienzo.", description: "Revisa postulaciones ficticias y cambia su estado." },
] as const;
type Section = typeof sections[number]["id"];
const courses = COURSES.slice(0, 3);
const notices = [
  { title: "Nuevo material: fundamentos de seguridad", type: "Material nuevo", text: "Ya puedes revisar la guía introductoria y los ejercicios de la primera unidad." },
  { title: "Bienvenido a tu próximo nivel", type: "Anuncio", text: "Revisa el temario y organiza tus próximos pasos antes de comenzar." },
  { title: "Prepara tu próxima unidad", type: "Anuncio", text: "Revisa los recursos de la unidad antes de continuar con tu aprendizaje." },
];

export default function DemoWorkspace() {
  const [section, setSection] = useState<Section>("courses");
  const [read, setRead] = useState<number[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [teacherCourses, setTeacherCourses] = useState(courses.map(course => course.title));
  const [courseName, setCourseName] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("Pendiente");
  const [feedback, setFeedback] = useState("");
  const current = sections.find(item => item.id === section)!;

  function select(next: Section) { setSection(next); setFeedback(""); }
  function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!courseName.trim()) return;
    setTeacherCourses(previous => [...previous, courseName.trim()]);
    setCourseName("");
    setFeedback("Curso de ejemplo creado en esta demo.");
  }
  function reset() {
    setRead([]); setCompleted([]); setCourseName("");
    setTeacherCourses(courses.map(course => course.title)); setApplicationStatus("Pendiente");
    setFeedback("Restablecimos todos los ejemplos.");
  }

  return <div className={styles.workspace}>
    <div className={styles.banner}><div><span className={styles.dot} /> DEMO LOCAL <span className={styles.bannerDetail}>Sin Google · Sin conexión al backend</span></div><Link href="/login">Volver al acceso <ArrowRight size={14} aria-hidden="true" /></Link></div>
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <p className={styles.eyebrow}>EXPLORA LA PLATAFORMA</p>
        <h1>Un vistazo<br />a lo que sigue.</h1>
        <p className={styles.sidebarText}>Recorre las vistas de estudiante, profesor y administrador.</p>
        <nav aria-label="Secciones de demostración">{sections.map((item, index) => <button key={item.id} onClick={() => select(item.id)} aria-current={section === item.id ? "page" : undefined}><span className={styles.index}>{String(index + 1).padStart(2, "0")}</span><span>{item.label}</span><ArrowRight size={14} aria-hidden="true" /></button>)}</nav>
        <div className={styles.demoNote}><strong>Todo es de ejemplo.</strong><p>Las acciones se guardan solo mientras esta página esté abierta. Al recargar se restablecen.</p><button onClick={reset}>Restablecer demo</button></div>
      </aside>
      <section className={styles.content} aria-labelledby="demo-title">
        <div className={styles.heading}><span className={styles.role}>{current.role} · Demo</span><h2 id="demo-title">{current.title}</h2><p>{current.description}</p></div>
        <div role="status" className={styles.feedback}>{feedback}</div>
        <div key={section} className={styles.view}>
          {section === "courses" && <>
            <div className={styles.stats}><div><strong>3</strong><span>Cursos de ejemplo</span></div><div><strong>1</strong><span>Completado</span></div><div><strong>—</strong><span>Certificados por integrar</span></div></div>
            <div className={styles.courseGrid}>{courses.map((course, index) => <article className={styles.course} key={course.id}><AreaArtwork areaId={course.areaId} /><div className={styles.courseBody}><span className="chip">{course.level}</span><h3>{course.title}</h3><p>{course.duration} · {course.hours} horas</p><div className={styles.progress} role="progressbar" aria-label={`Avance de ${course.title}`} aria-valuenow={[100, 40, 15][index]} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${[100, 40, 15][index]}%` }} /></div><small>{[100, 40, 15][index]}% completado · Ejemplo</small><button className="btn btn--primary btn--sm" onClick={() => { select("classroom"); }}>Ver aula de ejemplo <ArrowRight size={14} aria-hidden="true" /></button></div></article>)}</div>
          </>}
          {section === "profile" && <div className={styles.twoColumns}>
            <article className="card card-pad profile-card"><div className="avatar">AE</div><h3 className="profile-name">Alex Ejemplo</h3><p className="profile-email">alex@example.com</p><span className="chip">Estudiante · Demo</span><p className={styles.bodyText}>Aprendiendo a construir un futuro más seguro con tecnología.</p><div className="profile-stats"><div className="profile-stat"><strong>3</strong><span>cursos</span></div><div className="profile-stat"><strong>—</strong><span>certificados</span></div></div></article>
            <div className={styles.stack}><ProfileCertificates courses={courses} demo /><article className="card card-pad"><h3>Tu siguiente paso</h3><p className={styles.bodyText}>Continúa con tus cursos.</p><button className="btn btn--secondary btn--sm" onClick={() => select("courses")}>Ver mis cursos</button></article></div>
          </div>}
          {section === "classroom" && <CourseClassroom course={courses[0]} demo completed={completed} onComplete={index => { setCompleted(previous => previous.includes(index) ? previous : [...previous, index]); setFeedback("Lectura completada en la demo."); }} materials={<div className={styles.material}><span>Guía de la unidad</span><small>Recurso de muestra. El profesor publicará los materiales en el aula real.</small></div>} />}
          {section === "notifications" && <NotificationCenter items={notices.map((notice, index) => ({ id: String(index), titulo: notice.title, contenido: notice.text, tipo: ["MATERIAL", "ANUNCIO", "ANUNCIO"][index], codigoCurso: courses[0].id, fechaCreacion: "2026-11-24T10:00:00Z", leida: read.includes(index) }))} onRead={id => setRead(previous => previous.includes(Number(id)) ? previous : [...previous, Number(id)])} onOpen={item => select("classroom")} />}
          {section === "teacher" && <div className={styles.twoColumns}>
            <section className="card card-pad"><h3>Crear curso de ejemplo</h3><p className={styles.bodyText}>Prueba el formulario con datos ficticios.</p><form className="dashboard-form" onSubmit={createCourse}><label>Nombre del curso<input value={courseName} onChange={event => setCourseName(event.target.value)} placeholder="Introducción a Cloud" required maxLength={100} /></label><label>Nivel<select defaultValue="Básico"><option>Básico</option><option>Intermedio</option><option>Avanzado</option></select></label><button className="btn btn--primary btn--sm" type="submit">Crear en la demo</button></form></section>
            <section className="card card-pad"><h3>Mis cursos creados <span className="chip">{teacherCourses.length}</span></h3><div className="dashboard-list">{teacherCourses.map((title, index) => <article key={`${index}-${title}`}><strong>{title}</strong><span>Curso de muestra</span><div className={styles.material}><span>Material: guía introductoria</span><small>Ejemplo visual de material publicado.</small></div><div className={styles.material}><span>Anuncio: bienvenida al curso</span><small>Ejemplo visual de anuncio publicado.</small></div></article>)}</div></section>
          </div>}
          {section === "admin" && <>
            <QueueDeliveryMonitor />
            <div className={styles.stats}><div><strong>{applicationStatus === "Pendiente" ? 1 : 0}</strong><span>Postulaciones pendientes</span></div><div><strong>{applicationStatus === "Aprobada" ? 1 : 0}</strong><span>Aprobadas en la demo</span></div><div><strong>{applicationStatus === "Rechazada" ? 1 : 0}</strong><span>Rechazadas en la demo</span></div></div>
            <article className="card card-pad"><div className="section-head-inline"><div><p className={styles.eyebrow}>POSTULACIÓN FICTICIA</p><h3>María Ejemplo</h3><p className={styles.bodyText}>maria@example.com · Especialidad: Cloud & DevOps</p></div><span className="chip">{applicationStatus}</span></div><p className={styles.bodyText}>Experiencia de muestra: desarrollo de aplicaciones y acompañamiento a estudiantes. Motivación: compartir conocimientos de infraestructura y despliegue.</p><div className="notification-actions"><button className="btn btn--primary btn--sm" disabled={applicationStatus !== "Pendiente"} onClick={() => { setApplicationStatus("Aprobada"); setFeedback("Postulación ficticia aprobada. No se asignaron permisos reales."); }}>Aprobar en la demo</button><button className="btn btn--secondary btn--sm" disabled={applicationStatus !== "Pendiente"} onClick={() => { setApplicationStatus("Rechazada"); setFeedback("Postulación ficticia rechazada."); }}>Rechazar en la demo</button></div></article>
            <article className="card card-pad"><h3>Estado de la plataforma</h3><p className={styles.bodyText}>Las métricas y rutas reales requieren el backend. Esta demo permite revisar el diseño y las postulaciones de ejemplo.</p><span className="chip">Sin datos operativos</span></article>
          </>}
        </div>
      </section>
    </div>
  </div>;
}
