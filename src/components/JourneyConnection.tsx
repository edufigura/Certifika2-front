"use client";

import { useEffect, useRef } from "react";
import styles from "./JourneyConnection.module.css";

export default function JourneyConnection() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current!;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const progress = preference.matches ? 1 : Math.max(0, Math.min(1, (window.innerHeight * .85 - rect.top) / (window.innerHeight * .45)));
      element.style.setProperty("--connection-progress", String(progress));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", schedule);
    };
  }, []);
  return <div ref={root} className={`container ${styles.connection}`}>
    <div className={styles.line} aria-hidden="true"><span className={styles.fill} /><span className={styles.traveler} /></div>
    <div className={styles.copy}><p className="eyebrow">DE EXPLORAR A AVANZAR</p><p className={styles.title}>Ya encontraste tu camino.<br /><span>Ahora, recórrelo.</span></p></div>
  </div>;
}
