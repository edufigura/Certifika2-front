import type { Metadata } from "next";
import MyCoursesContent from "@/components/MyCoursesContent";

export const metadata: Metadata = {
  title: "Mis cursos",
};

export default function MisCursosPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">SIGUE DONDE LO DEJASTE</p>
          <h1 className="page-title">Mi aprendizaje.</h1>
          <p className="page-subtitle">
            Cada curso es una nueva oportunidad. Continúa con tu formación.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <MyCoursesContent />
        </div>
      </section>
    </>
  );
}
