import type { Metadata } from "next";
import Link from "next/link";
import ProfileLearningData from "@/components/ProfileLearningData";

export const metadata: Metadata = {
  title: "Mi perfil",
};

export default function PerfilPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">TU HISTORIA, EN CONSTRUCCIÓN</p>
          <h1 className="page-title">Mi perfil.</h1>
          <p className="page-subtitle">
            Tus datos, cursos y certificaciones.
          </p>
          <Link href="/perfil/demo" className="section-link" style={{ marginTop: 20 }}>Ver perfil de demostración sin iniciar sesión ↗</Link>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <ProfileLearningData />
      </section>
    </>
  );
}
