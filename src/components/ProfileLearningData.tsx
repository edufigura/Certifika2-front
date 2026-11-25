"use client";

import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import ProfileCertificates from "./ProfileCertificates";
import ProfileIdentity from "@/components/ProfileIdentity";
import { useEnrolledCourses } from "@/lib/enrollments";

export default function ProfileLearningData() {
  const { courses, failed, loading, signedIn } = useEnrolledCourses();
  const totalHours = courses.reduce((total, course) => total + course.hours, 0);

  if (!loading && !signedIn) return <div className="container empty-state"><span className="empty-state-icon" aria-hidden="true">↗</span><h2>Tu historia empieza contigo</h2><p>Entra con Google para ver tu perfil y los cursos en los que estás inscrito.</p><Link href="/login" className="btn btn--primary">Entrar con Google</Link></div>;

  return (
    <div className="container profile-grid">
      <aside className="card card-pad profile-card">
        <ProfileIdentity />
        <p className="profile-bio">
          Tu cuenta de Google, tu espacio para aprender.
        </p>
        <div className="profile-stats">
          <div className="profile-stat">
            <strong>{loading ? "…" : courses.length}</strong>
            <span>cursos</span>
          </div>
          <div className="profile-stat">
            <strong>0</strong>
            <span>certificados</span>
          </div>
          <div className="profile-stat">
            <strong>{loading ? "…" : courses.length}</strong>
            <span>en curso</span>
          </div>
        </div>
        <p className="profile-bio">
          Horas totales inscritas
          <strong style={{ display: "block", marginTop: 6, fontSize: 20, fontWeight: 700 }}>
            {loading ? "…" : `${totalHours} hs`}
          </strong>
        </p>
      </aside>

      <div className="profile-content">
        <div className="card card-pad">
          <div className="section-head-inline">
            <h2>Mis cursos</h2>
            <Link href="/mis-cursos" className="section-link">
              Ver todos →
            </Link>
          </div>
          {failed ? (
            <p className="page-subtitle">No pudimos cargar tus cursos.</p>
          ) : loading ? (
            <p className="page-subtitle">Cargando tus inscripciones…</p>
          ) : courses.length ? (
            <div className="courses-grid">
              {courses.slice(0, 2).map((course) => (
                <CourseCard key={course.id} course={course} enrolled />
              ))}
            </div>
          ) : (
            <p className="page-subtitle">Todavía no estás inscrito en ningún curso.</p>
          )}
        </div>

        <ProfileCertificates courses={courses} loading={loading} failed={failed} />

        <div className="card card-pad">
          <div className="section-head-inline">
            <h2>¿Buscas tu próxima certificación?</h2>
            <Link href="/cursos" className="btn btn--primary btn--sm">
              Explorar cursos
            </Link>
          </div>
          <p className="page-subtitle" style={{ marginTop: 0 }}>
            Descubre programas en todas las áreas y suma competencias a tu perfil.
          </p>
        </div>
      </div>
    </div>
  );
}
