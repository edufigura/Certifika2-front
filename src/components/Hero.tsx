"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AREAS } from "@/lib/data";
import AreaArtwork from "./AreaArtwork";
import styles from "./Hero.module.css";

export default function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const paused = hovered || focused || touching || reducedMotion;
  const move = (direction: number) => setActive(index => (index + direction + AREAS.length) % AREAS.length);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) video.current?.pause();
      else video.current?.play().catch(() => {});
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(index => (index + 1) % AREAS.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [active, paused]);

  return <section className={styles.hero} aria-labelledby="hero-title">
    <div className={styles.backdrop} aria-hidden="true">
      <video ref={video} className={styles.video} poster="https://cofounder.co/hero/cofounder-2-hero-poster.webp" muted loop playsInline preload="metadata">
        <source src="https://cofounder.co/hero/cofounder-2-hero.webm" type="video/webm" />
      </video><div className={styles.shade} />
    </div>
    <div className={styles.content}>
      <p className={styles.signature}>CERTIFIKA2 <span>— APRENDE. CONECTA. AVANZA.</span></p>
      <h1 id="hero-title">El futuro no se espera.<br /><em>Se aprende.</em></h1>
      <p className={styles.description}>Encuentra tu área, descubre tu próximo curso<br className={styles.break} /> y construye lo que sigue.</p>
      <div className={styles.carousel} role="region" aria-roledescription="carrusel" aria-label="Explora las áreas de aprendizaje" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        <div className={styles.timeline}><span>{String(active + 1).padStart(2,"0")}</span><div className={styles.stops}>{AREAS.map((area,index) => <button type="button" key={area.id} onClick={() => setActive(index)} aria-label={`Mostrar ${area.name}`} aria-current={active === index ? "step" : undefined}><span /></button>)}</div><span>{String(AREAS.length).padStart(2,"0")}</span></div>
        <div className={styles.cards} onTouchStart={event => { setTouching(true); touchStart.current = event.touches[0].clientX; }} onTouchEnd={event => {
          if (touchStart.current !== null) { const delta = touchStart.current - event.changedTouches[0].clientX; if (Math.abs(delta) > 50) move(delta > 0 ? 1 : -1); }
          touchStart.current = null;
          setTouching(false);
        }} onTouchCancel={() => { touchStart.current = null; setTouching(false); }}>
          {[0,1].map(offset => { const area = AREAS[(active + offset) % AREAS.length]; return <article key={area.id} className={styles.card}>
            <div className={styles.artwork}><AreaArtwork areaId={area.id} /></div>
            <div className={styles.cardContent}><span className={styles.cardNumber}>ÁREA {String((active + offset) % AREAS.length + 1).padStart(2,"0")}</span><h2>{area.name}</h2><p>{area.tagline}</p><Link href={`/cursos?area=${area.id}`}>Explorar <span aria-hidden="true">↗</span></Link></div>
          </article>; })}
        </div>
        <div className={styles.controls}><Link href="/cursos">Todo el catálogo ↗</Link></div>
        <span className={styles.srOnly} aria-live={paused ? "polite" : "off"} aria-atomic="true">Área {active + 1} de {AREAS.length}: {AREAS[active].name}</span>
      </div>
    </div>
    <Link className={styles.scroll} href="#como-funciona">Descubre tu recorrido <span aria-hidden="true">↓</span></Link>
  </section>;
}
