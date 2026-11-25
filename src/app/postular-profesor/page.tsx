import type { Metadata } from "next";
import TeacherRoadmap from "@/components/TeacherRoadmap";
import TeacherApplicationForm from "@/components/TeacherApplicationForm";

export const metadata: Metadata = { title: "Postular para enseñar" };

export default function TeacherApplicationPage() {
  return (
    <>
      <section className="page-head application-page-head bg-dots">
        <div className="container">
          <span className="application-eyebrow">Sé parte de Certifika2</span>
          <h1 className="page-title">Convierte tu experiencia en aprendizaje.</h1>
          <p className="page-subtitle">
            Postula para crear cursos, acompañar estudiantes y compartir conocimientos aplicados.
          </p>
        </div>
      </section>
      <TeacherRoadmap application />
      <section id="postulacion" className="section application-section">
        <TeacherApplicationForm />
      </section>
    </>
  );
}

