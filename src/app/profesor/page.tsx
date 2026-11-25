import type { Metadata } from "next";
import ProfessorDashboard from "@/components/ProfessorDashboard";

export const metadata: Metadata = { title: "Panel de profesor" };

export default function ProfesorPage() {
  return <><section className="page-head"><div className="container"><p className="eyebrow">TU EXPERIENCIA EN ACCIÓN</p><h1 className="page-title">Espacio docente.</h1><p className="page-subtitle">Crea cursos, comparte materiales y conecta con tus estudiantes.</p></div></section><section className="section dashboard-section"><ProfessorDashboard /></section></>;
}
