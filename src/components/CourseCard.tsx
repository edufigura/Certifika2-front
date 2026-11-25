import Link from "next/link";
import type { Course } from "@/lib/data";
import { getAreaById, getCourseById } from "@/lib/data";
import { Clock, GraduationCap } from "./icons";
import AreaArtwork from "./AreaArtwork";

export default function CourseCard({
  course,
  enrolled = false,
  progress,
}: {
  course: Course;
  enrolled?: boolean;
  progress?: number;
}) {
  const area = getAreaById(course.areaId);
  const href = getCourseById(course.id)
    ? `/cursos/${course.id}`
    : `/curso?codigo=${encodeURIComponent(course.id)}`;

  return (
    <article className="course-card">
      <Link href={href} className="course-card-link">
        <AreaArtwork areaId={course.areaId} />
        <div className="course-card-body">
        <div className="course-card-top">
          <span className="area-tag">
            <span
              className="area-dot"
              style={{ background: area?.color }}
              aria-hidden="true"
            />
            {area?.name}
          </span>
          <span className="course-level">{course.level}</span>
        </div>

        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-summary">{course.summary}</p>

        <div className="course-card-meta">
          <div className="meta-row">
            <span className="icon-inline">
              <Clock size={14} />
              {course.duration}
            </span>
            <span className="meta-sep">·</span>
            <span className="icon-inline">
              <GraduationCap size={14} />
              {course.certification ? "Certificado" : "Formación"}
            </span>
          </div>
          {enrolled && typeof progress === "number" && (
            <div className="progress">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
              <span className="progress-label">{progress}% completado</span>
            </div>
          )}
        </div>
        <div className="course-card-cta">{enrolled ? "Ir a mi curso" : "Explorar curso"}<span>↗</span></div>
        </div>
      </Link>
    </article>
  );
}
