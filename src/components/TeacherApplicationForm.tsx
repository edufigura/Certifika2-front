"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "@/lib/auth";
import {
  getMyTeacherApplication,
  legacyDraftForOwner,
  submitTeacherApplication,
  subscribeToTeacherApplications,
  type TeacherApplication,
} from "@/lib/teacherApplications";

const EMPTY_FORM = {
  specialty: "",
  experienceYears: "",
  profileUrl: "",
  motivation: "",
  availability: "",
};

const STATUS_COPY = {
  PENDING: {
    label: "En revisión",
    title: "Tu postulación está en revisión",
    text: "El equipo administrador revisará tu experiencia y motivación. Verás el resultado en esta misma página.",
  },
  APPROVED: {
    label: "Aprobada",
    title: "Tu postulación fue aprobada",
    text: "Tu cuenta ya está habilitada para enseñar. Cierra sesión y vuelve a ingresar con Google para actualizar tus permisos.",
  },
  REJECTED: {
    label: "No aprobada",
    title: "Tu postulación necesita algunos ajustes",
    text: "Puedes actualizar tus antecedentes y volver a enviarla cuando quieras.",
  },
} as const;

export default function TeacherApplicationForm() {
  const { signedIn, user, loading } = useSession();
  const [form, setForm] = useState(EMPTY_FORM);
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(true);
  const [error, setError] = useState("");
  const hydratedApplication = useRef<string | null>(null);

  useEffect(() => {
    if (!signedIn || !user) return;
    setApplications([]); setForm(EMPTY_FORM); setApplicationLoading(true); hydratedApplication.current = null;
    let active = true;
    const sync = () => { void getMyTeacherApplication().then(result => {
      if (!active) return;
      setApplications(result ? [result] : []); setError("");
    }).catch(() => { if (active) setError("No se pudo consultar tu postulación. Intenta nuevamente."); })
      .finally(() => { if (active) setApplicationLoading(false); }); };
    const draft = legacyDraftForOwner(user.id);
    if (draft) {
      setForm({ specialty: draft.specialty, experienceYears: String(draft.experienceYears), profileUrl: draft.profileUrl,
        motivation: draft.motivation, availability: draft.availability });
    }
    sync(); const unsubscribe = subscribeToTeacherApplications(sync);
    return () => { active = false; unsubscribe(); };
  }, [signedIn, user?.id]);

  const currentApplication = useMemo(
    () => applications.find((application) => application.applicantId === user?.id),
    [applications, user?.id],
  );

  useEffect(() => {
    if (!currentApplication || hydratedApplication.current === currentApplication.id) return;
    hydratedApplication.current = currentApplication.id;
    setForm({
      specialty: currentApplication.specialty,
      experienceYears: String(currentApplication.experienceYears),
      profileUrl: currentApplication.profileUrl,
      motivation: currentApplication.motivation,
      availability: currentApplication.availability,
    });
  }, [currentApplication]);

  if (loading) {
    return <div className="container section empty-state"><p>Preparando tu postulación…</p></div>;
  }

  if (!signedIn || !user) {
    return (
      <div className="container section empty-state">
        <span className="application-step">01</span>
        <h2>Inicia sesión para postular</h2>
        <p>Usaremos tu identidad verificada para asociar la solicitud a tu cuenta.</p>
        <Link className="btn btn--primary" href="/login">Iniciar sesión</Link>
      </div>
    );
  }

  if (user.groups.some((group) => group === "PROFESOR" || group === "ADMIN")) {
    return (
      <div className="container section empty-state">
        <span className="status-badge status-badge--ok">Profesor habilitado</span>
        <h2>Ya tienes acceso para enseñar</h2>
        <p>Administra tus cursos, contenido y materiales desde tu panel.</p>
        <Link className="btn btn--primary" href="/profesor">Ir al panel de profesor</Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSaving(true); setSubmitted(false); setError("");
    try {
    const result = await submitTeacherApplication({
      specialty: form.specialty.trim(),
      experienceYears: Number(form.experienceYears),
      profileUrl: form.profileUrl.trim(),
      motivation: form.motivation.trim(),
      availability: form.availability.trim(),
    });
    setApplications([result]);
    setSubmitted(true);
    } catch (error) { setError(error instanceof Error ? error.message : "No se pudo enviar la postulación."); }
    finally { setSaving(false); }
  }

  const status = currentApplication ? STATUS_COPY[currentApplication.status] : null;

  return (
    <div className="container application-layout">
      <aside className="application-aside">
        <span className="application-eyebrow">Proceso de selección</span>
        <h2>Comparte lo que sabes con una comunidad que quiere avanzar.</h2>
        <ol className="application-steps">
          <li><span>01</span><div><strong>Completa tu perfil</strong><p>Cuéntanos tu especialidad y experiencia.</p></div></li>
          <li><span>02</span><div><strong>Revisión del equipo</strong><p>Un administrador evaluará tu postulación.</p></div></li>
          <li><span>03</span><div><strong>Publica tu primer curso</strong><p>Al ser aprobado tendrás acceso al panel docente.</p></div></li>
        </ol>
      </aside>

      <section className="card card-pad application-card">
        {error && <p role="alert" className="auth-alert">{error}</p>}
        {applicationLoading && <p>Cargando tu postulación…</p>}
        {status ? (
          <div className={`application-status application-status--${currentApplication?.status.toLowerCase()}`}>
            <span className={`status-badge ${currentApplication?.status === "APPROVED" ? "status-badge--ok" : ""}`}>
              {status.label}
            </span>
            <h2>{status.title}</h2>
            <p>{status.text}</p>
          </div>
        ) : null}

        {currentApplication?.status !== "APPROVED" ? (
          <>
            <div className="application-form-head">
              <div>
                <span className="application-eyebrow">Tu postulación</span>
                <h2>{currentApplication ? "Actualizar antecedentes" : "Queremos conocerte"}</h2>
              </div>
              <span className="application-identity">{user.email}</span>
            </div>

            <form className="dashboard-form" onSubmit={handleSubmit}>
              <label>Área de especialidad
                <input required maxLength={80} placeholder="Ej. Ciberseguridad, IA o Cloud" value={form.specialty}
                  onChange={(event) => setForm({ ...form, specialty: event.target.value })} />
              </label>
              <div className="application-form-row">
                <label>Años de experiencia
                  <input required type="number" min="0" max="60" placeholder="Ej. 5" value={form.experienceYears}
                    onChange={(event) => setForm({ ...form, experienceYears: event.target.value })} />
                </label>
                <label>Disponibilidad semanal
                  <select required value={form.availability}
                    onChange={(event) => setForm({ ...form, availability: event.target.value })}>
                    <option value="">Seleccionar</option>
                    <option>2 a 4 horas</option>
                    <option>4 a 6 horas</option>
                    <option>6 a 8 horas</option>
                    <option>Más de 8 horas</option>
                  </select>
                </label>
              </div>
              <label>LinkedIn, portafolio o perfil profesional
                <input required type="url" placeholder="https://" value={form.profileUrl}
                  onChange={(event) => setForm({ ...form, profileUrl: event.target.value })} />
              </label>
              <label>¿Por qué quieres enseñar en Certifika2?
                <textarea required minLength={40} maxLength={600} rows={6}
                  placeholder="Cuéntanos qué te gustaría enseñar y qué experiencia aportarías a tus estudiantes."
                  value={form.motivation}
                  onChange={(event) => setForm({ ...form, motivation: event.target.value })} />
                <span className="field-hint">{form.motivation.length}/600 caracteres</span>
              </label>
              <div className="application-submit">
                <p>Al enviar, aceptas que el equipo revise la información de tu perfil.</p>
                <button className="btn btn--primary" type="submit" disabled={saving || applicationLoading}>
                  {saving ? "Enviando…" : currentApplication ? "Actualizar postulación" : "Enviar postulación"}
                </button>
              </div>
              {submitted ? <p className="auth-alert dashboard-alert" role="status">Postulación enviada correctamente.</p> : null}
            </form>
          </>
        ) : null}
      </section>
    </div>
  );
}

