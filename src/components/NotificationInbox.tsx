"use client";
import Link from "next/link";
import { useNotifications } from "@/lib/notifications";
import NotificationCenter from "./NotificationCenter";

export default function NotificationInbox() {
  const { items, signedIn, loading, error, reload, markRead } = useNotifications();
  if (!signedIn) return <div className="container empty-state"><h2>Conecta con lo nuevo</h2><p>Entra con tu cuenta de Google para ver las novedades de tus cursos.</p><Link href="/login" className="btn btn--primary">Entrar con Google</Link></div>;
  return <div className="container"><NotificationCenter items={items} loading={loading} error={error} onRead={markRead} onRefresh={reload} /></div>;
}
