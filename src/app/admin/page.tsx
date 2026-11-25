import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata: Metadata = { title: "Administración" };

export default function AdminPage() {
  return <><section className="page-head"><div className="container"><p className="eyebrow">DETRÁS DE CADA NUEVO COMIENZO</p><h1 className="page-title">Administración.</h1><p className="page-subtitle">Gestiona las postulaciones del equipo docente y supervisa la operación de la plataforma.</p></div></section><section className="section dashboard-section"><AdminDashboard /></section></>;
}
