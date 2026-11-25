import type { Metadata } from "next";
import Link from "next/link";
import ProfileCertificates from "@/components/ProfileCertificates";
import CourseCard from "@/components/CourseCard";
import { COURSES } from "@/lib/data";

export const metadata: Metadata = { title: "Mi perfil — Demostración" };

export default function ProfileDemoPage() {
  const courses = COURSES.slice(0, 2);
  return <>
    <section className="page-head"><div className="container">
      <p className="eyebrow">TU HISTORIA, EN CONSTRUCCIÓN</p>
      <h1 className="page-title">Mi perfil.</h1>
      <p className="page-subtitle">Tus datos, cursos y certificaciones.</p>
      <div className="profile-demo-notice"><div><strong>Vista de demostración</strong><p>Identidad y avances de ejemplo. Funciona sin iniciar sesión y no guarda cambios.</p></div><Link href="/perfil" className="section-link">Volver al perfil real ↗</Link></div>
    </div></section>
    <section className="section" style={{ paddingTop: 0 }}><div className="container profile-grid">
      <aside className="card card-pad profile-card">
        <div className="avatar">AE</div><h2 className="profile-name">Alex Ejemplo</h2><p className="profile-email">alex@example.com</p>
        <div className="profile-groups"><span className="profile-group">Estudiante · Demo</span></div>
        <p className="profile-bio">Aprendiendo a construir un futuro más seguro con tecnología.</p>
        <div className="profile-stats"><div className="profile-stat"><strong>2</strong><span>cursos</span></div><div className="profile-stat"><strong>—</strong><span>certificados</span></div><div className="profile-stat"><strong>1</strong><span>en curso</span></div></div>
        <p className="profile-bio">Horas totales inscritas<strong style={{ display: "block", marginTop: 6, fontSize: 20 }}>{courses.reduce((sum, course) => sum + course.hours, 0)} hs</strong></p>
      </aside>
      <div className="profile-content">
        <div className="card card-pad"><div className="section-head-inline"><h2>Mis cursos</h2><span className="chip">Avances de ejemplo</span></div><div className="courses-grid">{courses.map((course, index) => <CourseCard key={course.id} course={course} enrolled progress={index === 0 ? 100 : 40} />)}</div></div>
        <ProfileCertificates courses={courses} demo />
        <div className="card card-pad"><div className="section-head-inline"><h2>Tu siguiente paso.</h2><Link href="/cursos" className="btn btn--primary btn--sm">Explorar cursos ↗</Link></div><p className="page-subtitle">Sigue explorando las áreas y encuentra tu próximo desafío.</p></div>
      </div>
    </div></section>
  </>;
}
