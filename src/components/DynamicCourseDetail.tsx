"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { courseFromBackend, type BackendCourse } from "@/lib/backendCourses";
import { useSession } from "@/lib/auth";
import CourseEnrollment from "@/components/CourseEnrollment";
import CourseMaterials from "@/components/CourseMaterials";
import CourseChat from "@/components/CourseChat";
import CourseClassroom from "@/components/CourseClassroom";
import { ArrowLeft } from "@/components/icons";

export default function DynamicCourseDetail() {
  const code = useSearchParams().get("codigo") ?? "";
  const { signedIn, loading: sessionLoading } = useSession();
  const [backendCourse, setBackendCourse] = useState<BackendCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    if (!signedIn || !code) {
      setLoading(false);
      return;
    }
    fetch(`/api/bff/cursos/codigo/${encodeURIComponent(code)}`, { credentials: "include", cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<BackendCourse> : Promise.reject())
      .then(setBackendCourse)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [code, sessionLoading, signedIn]);

  if (sessionLoading || loading) return <div className="container section">Cargando curso…</div>;
  if (!signedIn) return <div className="container section empty-state"><h2>Inicia sesión para abrir este curso</h2><Link className="btn btn--primary" href="/login">Iniciar sesión</Link></div>;
  if (failed || !backendCourse) return <div className="container section empty-state"><h2>Curso no disponible</h2><Link className="btn btn--secondary" href="/cursos">Volver al catálogo</Link></div>;

  const course = courseFromBackend(backendCourse);
  return <section className="course-detail container">
    <div className="section-head-inline"><Link href="/mis-cursos" className="back-link"><ArrowLeft size={15} />Mis cursos</Link><CourseEnrollment courseCode={course.id} /></div>
    <CourseClassroom course={course} materials={<CourseMaterials courseCode={course.id} />} discussion={<CourseChat courseCode={course.id} />} />
  </section>;
}
