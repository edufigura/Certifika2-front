"use client";

import Link from "next/link";
import { GraduationCap } from "./icons";
import type { Course } from "@/lib/data";
import type { Certificate } from "@/lib/certificates";
import styles from "./ProfileCertificates.module.css";

type Props = { certificates?: Certificate[]; courses?: Course[]; demo?: boolean; loading?: boolean; failed?: boolean; onRefresh?: () => void };
export default function ProfileCertificates({ certificates = [], demo = false, loading = false, failed = false, onRefresh }: Props) {
  return <section id="certificados" className={styles.section} aria-labelledby="certificates-heading">
    <header className={styles.heading}><span className={styles.icon}><GraduationCap size={24} /></span><div><p>TU RECORRIDO, EN DOCUMENTOS</p><h2 id="certificates-heading">Mis certificados</h2></div><span className={styles.badge}>{certificates.length} emitidos</span></header>
    <p className={styles.intro}>Consulta y descarga los certificados emitidos a tu cuenta. Las nuevas emisiones pueden tardar unos segundos.</p>
    {onRefresh && <button type="button" className="btn btn--secondary btn--sm" onClick={onRefresh}>Actualizar certificados</button>}
    {loading ? <p role="status" className={styles.intro}>Consultando certificados…</p> : failed ? <p role="alert" className={styles.intro}>No se pudieron cargar tus certificados. Actualiza la lista o vuelve a iniciar sesión.</p> : certificates.length ? <div className={styles.list}>{certificates.map(certificate =>
      <article key={certificate.idCertificado} className={styles.certificate}><div><h3>{certificate.nombreCurso}</h3><p>{certificate.nivelCurso} · {certificate.formato} · {new Date(certificate.fechaEmision).toLocaleDateString("es-CL")}</p><p className={styles.code}>Código: {certificate.codigoVerificacion}</p></div><div className={styles.actions}>
        <a className="btn btn--primary btn--sm" href={`/api/bff/certificados/${certificate.idCertificado}/descarga`}>Descargar {certificate.formato}</a>
        <Link className="section-link" href={`/verificar?codigo=${encodeURIComponent(certificate.codigoVerificacion)}`}>Verificar →</Link>
      </div></article>)}</div> : <div className={styles.pending}><span className={styles.documentIcon} aria-hidden="true"><GraduationCap size={32} /></span><h3>Tu próximo logro tendrá su lugar.</h3><p>{demo ? "Los certificados reales de tu cuenta aparecen al iniciar sesión." : "Todavía no tienes certificados emitidos. Solicita el tuyo desde el aula una vez que tu profesor haya confirmado la finalización."}</p></div>}
  </section>;
}