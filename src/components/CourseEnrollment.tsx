"use client";

import { useState } from "react";
import Link from "next/link";
import { useEnrolledCourses } from "@/lib/enrollments";

export default function CourseEnrollment({ courseCode }: { courseCode: string }) {
  const { courses, failed: loadFailed, loading, signedIn } = useEnrolledCourses();
  const [justEnrolled, setJustEnrolled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const enrolled = justEnrolled || courses.some((course) => course.id === courseCode);

  async function enroll() {
    setSubmitting(true);
    setFailed(false);
    try {
      const response = await fetch(
        `/api/bff/cursos/codigo/${encodeURIComponent(courseCode)}/inscribir`,
        { method: "POST", credentials: "include" },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setJustEnrolled(true);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <button type="button" className="btn btn--primary btn--block" disabled>
        Verificando inscripción…
      </button>
    );
  }

  if (!signedIn) {
    return (
      <Link href="/login" className="btn btn--primary btn--block">
        Iniciar sesión para inscribirme
      </Link>
    );
  }

  if (enrolled) {
    return (
      <>
        <Link href="/mis-cursos" className="btn btn--primary btn--block">
          Ir a mi curso
        </Link>
        <p className="sidebar-note">Ya estás inscrito en este curso.</p>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className="btn btn--primary btn--block"
        disabled={submitting}
        onClick={enroll}
      >
        {submitting ? "Inscribiendo…" : "Inscribirme al curso"}
      </button>
      <p className="sidebar-note">
        {failed || loadFailed
          ? "No se pudo completar la inscripción. Intenta nuevamente."
          : "Tu inscripción quedará guardada en tu cuenta."}
      </p>
    </>
  );
}
