import Link from "next/link";
import Brand from "./Brand";
import { AREAS } from "@/lib/data";

export default function Footer() {
  return <footer className="footer"><div className="container footer-grid">
    <div><Link href="/" className="footer-brand" aria-label="Certifika2 — Inicio"><Brand /></Link><p className="footer-text">La curiosidad abre caminos.<br />El aprendizaje te lleva más lejos.</p><span className="footer-signature">APRENDE. CONECTA. AVANZA. ↗</span></div>
    <div><p className="footer-title">Explora</p><ul className="footer-list">{AREAS.slice(0, 5).map(area => <li key={area.id}><Link href={`/cursos?area=${area.id}`}>{area.name}</Link></li>)}</ul></div>
    <div><p className="footer-title">Tu espacio</p><ul className="footer-list"><li><Link href="/cursos">Todos los cursos</Link></li><li><Link href="/mis-cursos">Mi aprendizaje</Link></li><li><Link href="/perfil">Mi perfil</Link></li><li><Link href="/notificaciones">Notificaciones</Link></li><li><Link href="/postular-profesor">Quiero enseñar ↗</Link></li></ul></div>
  </div><div className="container footer-bottom"><p>© {new Date().getFullYear()} Certifika2</p><p>Tu próximo nivel empieza aquí.</p><Link href="/login">Entrar con Google ↗</Link></div></footer>;
}
