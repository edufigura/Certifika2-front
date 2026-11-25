"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./LearningRoadmap.module.css";

const steps = [
  { title: "Selecciona tu curso.", label: "DESCUBRE", text: "Todo empieza con una pregunta: ¿qué quieres aprender? Explora las áreas, revisa el temario y encuentra tu próximo desafío.", detail: "Tu curiosidad marca el destino.", icon: "↗" },
  { title: "Inscríbete y aprende.", label: "COMIENZA", text: "Entra con tu cuenta de Google, inscríbete y accede a los materiales de tu curso. Haz espacio para nuevas ideas.", detail: "Del primer clic al primer aprendizaje.", icon: "+" },
  { title: "Pon a prueba lo aprendido.", label: "DEMUESTRA", text: "El siguiente hito del recorrido es rendir el examen: una oportunidad para demostrar tus conocimientos y reconocer lo que has aprendido.", detail: "Cada desafío muestra cuánto has avanzado.", icon: "◎" },
  { title: "Certifica tu recorrido.", label: "AVANZA", text: "La meta: completar los requisitos del curso y certificar lo aprendido. Un cierre para este recorrido y un comienzo para lo que sigue.", detail: "Tu próximo paso empieza aquí.", icon: "✧" },
];

export default function LearningRoadmap() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = root.current!;
    const track = section.querySelector<HTMLElement>("[data-roadmap-track]")!;
    const viewport = track.parentElement!;
    const markers = Array.from(section.querySelectorAll<HTMLElement>("[data-roadmap-marker]"));
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let distance = 0;
    let travel = 0;
    let position = 0;
    let lastFrameTime = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrameTime = 0;
      delete section.dataset.animated;
      section.style.height = "";
      track.style.transform = "";
      section.style.removeProperty("--roadmap-progress");
      markers.forEach(marker => marker.removeAttribute("aria-current"));
    };
    const progressAtScroll = () => Math.max(0, Math.min(1, (100 - section.getBoundingClientRect().top) / travel));
    const paint = (time = performance.now()) => {
      frame = 0;
      if (!section.dataset.animated) return;
      const progress = progressAtScroll();
      // Continuous motion with a short, frame-rate-independent smoothing tail.
      const elapsed = lastFrameTime ? Math.min(64, time - lastFrameTime) : 16;
      lastFrameTime = time;
      position += (progress - position) * (1 - Math.exp(-elapsed / 75));
      if (Math.abs(progress - position) * distance < .35) position = progress;
      track.style.transform = `translate3d(${-distance * position}px,0,0)`;
      section.style.setProperty("--roadmap-progress", String(position));
      markers.forEach((marker, index) => {
        if (index === Math.round(position * (steps.length - 1))) marker.setAttribute("aria-current", "step");
        else marker.removeAttribute("aria-current");
      });
      if (position !== progress) frame = requestAnimationFrame(paint);
      else lastFrameTime = 0;
    };
    const measure = () => {
      reset();
      if (preference.matches || window.innerHeight < 660) return;
      section.dataset.animated = "true";
      const stageHeight = section.firstElementChild!.getBoundingClientRect().height;
      if (stageHeight > window.innerHeight - 110) { reset(); return; }
      distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      // Keep the gesture length independent of the horizontal desktop width.
      travel = Math.max(900, Math.min(1400, window.innerHeight * 1.4));
      section.style.height = `${stageHeight + travel}px`;
      position = progressAtScroll();
      paint();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    // Keep every link reachable without requiring scroll gestures.
    const focus = () => reset();
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    preference.addEventListener("change", measure);
    section.addEventListener("focusin", focus);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      preference.removeEventListener("change", measure);
      section.removeEventListener("focusin", focus);
      reset();
    };
  }, []);

  return <section ref={root} id="como-funciona" className={styles.roadmap} aria-labelledby="roadmap-title">
    <div className={styles.stage}><div className="container">
      <div className={styles.heading}><div><p className="eyebrow">TU RECORRIDO EN CERTIFIKA2</p><h2 id="roadmap-title" className="section-title">Un paso abre el siguiente.</h2></div><span className={styles.hint}>Avanza con el scroll <span aria-hidden="true">↓</span></span></div>
      <ol className={styles.timeline} aria-label="Etapas del aprendizaje">{steps.map((step, index) => <li key={step.label} data-roadmap-marker><span>0{index + 1}</span>{step.label}</li>)}</ol>
      <div className={styles.viewport}><div className={styles.track} data-roadmap-track>{steps.map((step, index) => <article key={step.label} className={styles.card}>
        <div className={styles.cardTop}><span>ETAPA 0{index + 1}</span><span className={styles.symbol} aria-hidden="true">{step.icon}</span></div>
        <h3>{step.title}</h3><p>{step.text}</p><div className={styles.cardEnd}>{step.detail}</div>
      </article>)}</div></div>
      <div className={styles.outro}><span>Tu recorrido comienza con una elección.</span><Link href="/cursos">Encuentra tu curso ↗</Link></div>
    </div></div>
  </section>;
}
