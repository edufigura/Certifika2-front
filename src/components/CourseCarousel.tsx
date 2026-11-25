"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./CourseCarousel.module.css";

export default function CourseCarousel({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const element = track.current!;
    const update = () => setEdges({ start: element.scrollLeft <= 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => { observer.disconnect(); element.removeEventListener("scroll", update); };
  }, []);
  const move = (direction: number) => {
    const element = track.current!;
    const card = element.firstElementChild as HTMLElement | null;
    element.scrollBy({ left: direction * ((card?.offsetWidth ?? element.clientWidth) + 22), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <div role="region" aria-roledescription="carrusel" aria-label="Cursos destacados">
    <div className={styles.track} ref={track} id={id} tabIndex={0}>{children}</div>
    <div className={styles.controls}>
      <span>Encuentra tu siguiente paso <span aria-hidden="true">↗</span></span>
      <div className={styles.buttons}>
        <button type="button" aria-label="Cursos anteriores" aria-controls={id} disabled={edges.start} onClick={() => move(-1)}>←</button>
        <button type="button" aria-label="Cursos siguientes" aria-controls={id} disabled={edges.end} onClick={() => move(1)}>→</button>
      </div>
    </div>
  </div>;
}
