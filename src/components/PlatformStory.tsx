import Link from "next/link";
import { AREAS, COURSES } from "@/lib/data";
import styles from "./PlatformStory.module.css";

export function PlatformValue() {
  return <section className={styles.value} aria-labelledby="platform-value-title"><div className="container">
    <div className={styles.intro}>
      <div><p className={styles.eyebrow}>EL CONOCIMIENTO NECESITA UN SIGUIENTE PASO</p><h2 id="platform-value-title">De querer aprender<br />a saber por dónde empezar.</h2></div>
      <div><p className={styles.lead}>Certifika2 reúne formación en tecnología, materiales y conversación por curso en un mismo lugar. Para quienes empiezan, quienes quieren profundizar y quienes tienen experiencia que compartir.</p><Link href="#como-funciona" className={styles.link}>Conoce la experiencia ↓</Link></div>
    </div>
    <dl className={styles.facts}>
      <div><dt>Áreas de tecnología</dt><dd>{AREAS.length}<span>Distintos caminos para tu curiosidad.</span></dd></div>
      <div><dt>Cursos en el catálogo</dt><dd>{COURSES.length}<span>Temarios para explorar antes de elegir.</span></dd></div>
      <div><dt>Niveles de formación</dt><dd>{new Set(COURSES.map(course => course.level)).size}<span>Desde lo básico hasta lo avanzado.</span></dd></div>
    </dl>
    <div className={styles.benefits}>
      <article><span>01 / CLARIDAD</span><h3>Elige con contexto.</h3><p>Revisa el nivel, la duración y los temas de cada curso. Encuentra una propuesta que conecte con lo que quieres aprender.</p></article>
      <article><span>02 / CONTINUIDAD</span><h3>Vuelve a tu aprendizaje.</h3><p>Reúne tus cursos inscritos en tu espacio personal y accede a los materiales para continuar con tu formación.</p></article>
      <article><span>03 / CONEXIÓN</span><h3>Haz lugar a las preguntas.</h3><p>La conversación del curso acompaña los contenidos: un espacio para plantear dudas e intercambiar ideas.</p></article>
    </div>
  </div></section>;
}

export function PlatformQuestions() {
  return <section className="section" aria-labelledby="platform-questions-title"><div className={`container ${styles.questions}`}>
    <div><p className="eyebrow">ANTES DE DAR EL PRIMER PASO</p><h2 id="platform-questions-title" className="section-title">Conoce el espacio.<br />Encuentra tu lugar.</h2><p className="section-subtitle">Aprender y compartir conocimiento empiezan con una decisión sencilla.</p><Link href="/cursos" className={`section-link ${styles.questionLink}`}>Explorar el catálogo ↗</Link></div>
    <div className={styles.answers}>
      <details open><summary>¿Qué es Certifika2?</summary><p>Una plataforma de formación en tecnología que conecta un catálogo de cursos con un espacio personal de aprendizaje. Puedes explorar áreas, conocer los temarios y acceder a los cursos en los que te inscribes.</p></details>
      <details><summary>¿Necesito experiencia previa?</summary><p>El catálogo incluye niveles básico, intermedio y avanzado. Revisa el nivel y el temario de cada curso para elegir según tus conocimientos y objetivos.</p></details>
      <details><summary>¿Cómo empiezo a aprender?</summary><p>Explora el catálogo, elige un curso e inicia sesión con Google para inscribirte. Desde Mi aprendizaje puedes volver a tus cursos y acceder a sus materiales.</p></details>
      <details><summary>¿También puedo enseñar?</summary><p>Sí. Si tienes conocimientos que compartir, envía tu postulación como profesor para su revisión. <Link href="/postular-profesor">Conoce el formulario de postulación ↗</Link></p></details>
    </div>
  </div></section>;
}
