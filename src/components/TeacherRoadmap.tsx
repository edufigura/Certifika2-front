"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import styles from "./TeacherRoadmap.module.css";

const steps = [
  { label: "Comparte tu experiencia", title: "Todo empieza con lo que sabes.", text: "Cuéntanos tu especialidad, experiencia y motivación. Tu postulación es el primer paso para formar parte de la comunidad docente.", note: "Tu experiencia tiene algo que enseñar.", tag: "POSTULACIÓN" },
  { label: "Conoce el resultado", title: "Una propuesta, un nuevo comienzo.", text: "El equipo revisa tus antecedentes. Consulta el estado de tu solicitud desde la página de postulación y, si hace falta, actualiza tu información.", note: "La aprobación habilita tu espacio docente.", tag: "REVISIÓN" },
  { label: "Da forma a tu curso", title: "Convierte tus ideas en un recorrido.", text: "Con tu perfil aprobado, organiza los contenidos y materiales de tus cursos desde el espacio docente. Dale estructura a lo que quieres compartir.", note: "Cada contenido abre una nueva posibilidad.", tag: "CREACIÓN" },
  { label: "Acompaña a aprender", title: "El conocimiento crece al compartirlo.", text: "Publica anuncios y participa en las conversaciones de tus cursos. Acompaña las preguntas que aparecen mientras tus estudiantes aprenden.", note: "Tu experiencia. El comienzo de alguien más.", tag: "COMUNIDAD" },
];

function TeacherVector({ step }: { step: number }) {
  return <svg viewBox="0 0 420 300" fill="none" aria-hidden="true" className={styles.vector}>
    <circle cx="210" cy="148" r="119" stroke="currentColor" opacity=".12" />
    <ellipse cx="210" cy="148" rx="171" ry="74" stroke="currentColor" opacity=".16" transform="rotate(-24 210 148)" />
    <circle cx="337" cy="89" r="6" fill="currentColor" opacity=".5" />
    <circle cx="71" cy="206" r="4" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {step === 0 && <><rect x="133" y="49" width="165" height="207" rx="18" fill="white" fillOpacity=".6" /><circle cx="215" cy="107" r="23" fill="currentColor" fillOpacity=".07" /><path d="M186 154c0-32 58-32 58 0M163 180h105m-105 19h76m-76 19h51" /><rect x="272" y="179" width="54" height="54" rx="15" fill="#254bff" stroke="#254bff" /><path d="M287 206h24m-12-12v24" stroke="white" /></>}
      {step === 1 && <><rect x="115" y="66" width="190" height="178" rx="18" fill="white" fillOpacity=".6" /><path d="M147 106h92m-92 26h112m-112 26h65" /><circle cx="276" cy="202" r="42" fill="#254bff" stroke="#254bff" /><path d="m257 203 13 13 26-29" stroke="white" strokeWidth="4" /><path d="M148 204h48" /></>}
      {step === 2 && <><rect x="88" y="65" width="245" height="169" rx="16" fill="white" fillOpacity=".6" /><path d="M88 99h245m-153 135-10 22h80l-10-22" /><circle cx="107" cy="83" r="2" /><circle cx="118" cy="83" r="2" /><rect x="109" y="117" width="67" height="94" rx="7" fill="currentColor" fillOpacity=".08" /><path d="M195 125h111m-111 20h85m-85 20h100m-100 20h65" /><path d="m131 146 23 14-23 14v-28Z" fill="currentColor" /></>}
      {step === 3 && <><rect x="122" y="62" width="182" height="107" rx="20" fill="white" fillOpacity=".6" /><path d="m159 169-16 22v-22m12-72h116m-116 23h83m-83 23h97" /><circle cx="105" cy="204" r="20" /><circle cx="214" cy="223" r="20" fill="currentColor" fillOpacity=".1" /><circle cx="320" cy="204" r="20" /><path d="M74 258c0-40 62-40 62 0m47 19c0-40 62-40 62 0m44-19c0-40 62-40 62 0" /></>}
    </g>
    <path d="m83 78 4-12 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" fill="currentColor" opacity=".65" />
  </svg>;
}

export default function TeacherRoadmap({ application = false }: { application?: boolean }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const id = useId();
  const step = steps[active];
  useEffect(() => {
    const element = root.current!;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { element.dataset.entered = "true"; observer.disconnect(); }
    }, { threshold: .15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <section ref={root} className={styles.section} aria-labelledby={`${id}-title`}>
    <div className="container">
      <div className={styles.heading}><div><p className="eyebrow">PROFESORES / COMPARTE LO QUE SABES</p><h2 id={`${id}-title`}>Tu experiencia merece<br /><em>llegar más lejos.</em></h2></div><p>Hay alguien esperando aprender<br />eso que tú ya sabes.<br /><span>Así empieza tu recorrido como docente.</span></p></div>
      <div className={styles.surface}>
        <ol className={styles.steps} aria-label="Recorrido del profesor">{steps.map((item, index) => <li key={item.tag}><button type="button" aria-current={active === index ? "step" : undefined} aria-controls={`${id}-detail`} onClick={() => setActive(index)}><span className={styles.dot}>{String(index + 1).padStart(2,"0")}</span><span>{item.label}</span></button></li>)}</ol>
        <div id={`${id}-detail`} className={styles.detail}>
          <div className={styles.illustration} key={`vector-${active}`}><TeacherVector step={active} /><span className={styles.vectorLabel}>CERTIFIKA2 / {step.tag}</span></div>
          <div className={styles.copy} key={`copy-${active}`} aria-live="polite" aria-atomic="true"><p className="eyebrow">0{active + 1} / {step.tag}</p><h3>{step.title}</h3><p className={styles.description}>{step.text}</p><p className={styles.note}>{step.note}</p></div>
        </div>
        <div className={styles.footer}><span>De compartir tu experiencia a acompañar nuevas ideas.</span><Link href={application ? "#postulacion" : "/postular-profesor"} className="btn btn--primary">{application ? "Completar mi postulación" : "Quiero enseñar"} <span aria-hidden="true">↗</span></Link></div>
      </div>
    </div>
  </section>;
}
