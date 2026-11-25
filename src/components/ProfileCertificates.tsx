import { GraduationCap } from "./icons";
import type { Course } from "@/lib/data";
import styles from "./ProfileCertificates.module.css";

export default function ProfileCertificates({ loading = false, failed = false }: { courses?: Course[]; demo?: boolean; loading?: boolean; failed?: boolean }) {
  return <section className={styles.section} aria-labelledby="certificates-heading">
    <header className={styles.heading}><span className={styles.icon}><GraduationCap size={24} /></span><div><p>TU RECORRIDO, EN DOCUMENTOS</p><h2 id="certificates-heading">Mis certificados</h2></div><span className={styles.badge}>Próximamente</span></header>
    <p className={styles.intro}>Un espacio para consultar la emisión y descargar los certificados de tus cursos.</p>
    <div className={styles.pending}><span className={styles.documentIcon} aria-hidden="true"><GraduationCap size={32} /></span><h3>Tu próximo logro tendrá su lugar.</h3><p>{loading ? "Consultando tus cursos…" : failed ? "No se pudieron cargar tus cursos. Intenta actualizar tu perfil." : "El servicio de emisión todavía no está conectado. Tus certificados aparecerán aquí cuando estén disponibles."}</p></div>
  </section>;
}
