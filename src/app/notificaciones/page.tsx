import type { Metadata } from "next";
import NotificationInbox from "@/components/NotificationInbox";
export const metadata: Metadata = { title: "Notificaciones" };
export default function NotificacionesPage() {
  return <><section className="page-head"><div className="container">
    <p className="eyebrow">MANTENTE AL DÍA</p><h1 className="page-title">Lo nuevo, aquí.</h1><p className="page-subtitle">Las novedades de los cursos en los que estás inscrito.</p>
  </div></section><section className="section" style={{ paddingTop: 0 }}><NotificationInbox /></section></>;
}
