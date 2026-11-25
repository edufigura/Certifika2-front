"use client";

import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import { BrandMark } from "@/components/Brand";
import { useEnrolledCourses } from "@/lib/enrollments";

export default function MyCoursesContent() {
  const { courses, failed, loading, signedIn } = useEnrolledCourses();

  if (loading) {
    return <p>Cargando tus inscripciones…</p>;
  }

  if (!signedIn) {
    return (
      <div className="empty-state">
        <h2>Inicia sesión para ver tus cursos</h2>
        <Link href="/login" className="btn btn--primary">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="empty-state">
        <h2>No pudimos cargar tus cursos</h2>
        <p>Intenta nuevamente en unos segundos.</p>
      </div>
    );
  }

  if (courses.length > 0) {
    return (
      <div className="courses-grid">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} enrolled />
        ))}
      </div>
    );
  }

  return (
    <div className="empty-state">
      <BrandMark />
      <h2>No estás inscrito en ningún curso</h2>
      <p>Explora el catálogo y empieza tu primera certificación.</p>
      <Link href="/cursos" className="btn btn--primary">
        Explorar cursos
      </Link>
    </div>
  );
}
