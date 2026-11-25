import Link from "next/link";
import { BrandMark } from "@/components/Brand";

export default function NotFound() {
  return <section className="container section"><div className="empty-state"><BrandMark /><p className="eyebrow">404 / UN DESVÍO EN EL CAMINO</p><h1 className="section-title">Tu próximo paso no está aquí.</h1><p>Esta página no existe o cambió de dirección. Todavía hay mucho por descubrir.</p><Link className="btn btn--primary" href="/cursos">Explorar cursos ↗</Link></div></section>;
}
