import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  COURSES,
  getAreaById,
  getCourseById,
} from "@/lib/data";
import CourseEnrollment from "@/components/CourseEnrollment";
import CourseChat from "@/components/CourseChat";
import CourseMaterials from "@/components/CourseMaterials";
import AreaArtwork from "@/components/AreaArtwork";
import { ArrowLeft, Clock, GraduationCap, Check } from "@/components/icons";

export function generateStaticParams() {
  return COURSES.map((course) => ({ id: course.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = getCourseById(id);
  return {
    title: course?.title ?? "Curso",
    description: course?.summary,
  };
}

export default async function CursoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = getCourseById(id);
  if (!course) notFound();

  const area = getAreaById(course.areaId);
  return (
    <section className="course-detail container">
      <Link href="/cursos" className="back-link">
        <ArrowLeft size={15} />
        Volver a cursos
      </Link>

      <div>
        <h1 className="course-detail-title">{course.title}</h1>
        <div className="course-detail-meta">
          <span className="area-tag">
            <span className="area-dot" style={{ background: area?.color }} aria-hidden="true" />
            {area?.name}
          </span>
          <span className="chip">Nivel {course.level}</span>
          <span className="icon-inline">
            <Clock size={14} />
            {course.duration} · {course.hours} hs
          </span>
        </div>
      </div>

      <div className="course-detail-art"><AreaArtwork areaId={course.areaId} /></div>
      <div className="course-detail-layout">
        <div className="prose">
          <h2>Sobre el curso</h2>
          <p>{course.description}</p>

          <h2>¿Qué vas a aprender?</h2>
          <ul className="topic-list">
            {course.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>

          <h2>Material complementario</h2>
          <CourseMaterials courseCode={course.id} />

          <CourseChat courseCode={course.id} />
        </div>

        <aside className="sidebar">
          <div className="sidebar-card">
            <p className="sidebar-price">Gratis</p>
            <ul className="sidebar-list">
              <li>
                <Clock size={14} />
                <span>
                  Duración: <strong>{course.duration}</strong>
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Nivel: <strong>{course.level}</strong>
                </span>
              </li>
              <li>
                <GraduationCap size={14} />
                <span>
                  Certificado: <strong>{course.certification ? "Incluido" : "No incluido"}</strong>
                </span>
              </li>
            </ul>

            <CourseEnrollment courseCode={course.id} />
          </div>
        </aside>
      </div>
    </section>
  );
}
