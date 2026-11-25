"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import Brand from "@/components/Brand";
import AreaArtwork from "@/components/AreaArtwork";
import { ArrowRight } from "@/components/icons";
import { AREAS } from "@/lib/data";
import { signOut, useSession } from "@/lib/auth";
import { useNotifications } from "@/lib/notifications";
import styles from "./Header.module.css";

type Panel = "explore" | "learning" | "space" | "mobile";
function Chevron() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { signedIn, user } = useSession();
  const { noLeidas } = useNotifications();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [visiblePanel, setVisiblePanel] = useState<Panel | null>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [activeArea, setActiveArea] = useState(AREAS[0]);
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const header = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTeacher = user?.groups.some(group => group === "PROFESOR" || group === "ADMIN");
  const isAdmin = user?.groups.includes("ADMIN");
  const home = pathname === "/";
  function cancelClose() { if (leaveTimer.current) clearTimeout(leaveTimer.current); }
  function close() { cancelClose(); setPanel(null); }
  function open(next: Panel, button: HTMLButtonElement) {
    cancelClose(); trigger.current = button; setError("");
    const navBounds = nav.current?.getBoundingClientRect();
    const buttonBounds = button.getBoundingClientRect();
    if (navBounds && nav.current?.contains(button)) {
      setIndicator({ left: buttonBounds.left - navBounds.left, width: buttonBounds.width });
    }
    setVisiblePanel(next); setPanel(next);
  }
  function hover(next: Panel, button: HTMLButtonElement) {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) open(next, button);
  }
  function activate(next: Panel, button: HTMLButtonElement, detail: number) {
    const mouseClick = detail > 0 && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (panel === next && !mouseClick) close();
    else open(next, button);
  }
  function deferClose() { cancelClose(); leaveTimer.current = setTimeout(() => setPanel(null), 240); }
  function keyboardOpen(event: KeyboardEvent<HTMLButtonElement>, next: Panel) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault(); open(next, event.currentTarget);
    requestAnimationFrame(() => header.current?.querySelector<HTMLElement>(`#nav-${next} a[href]`)?.focus());
  }
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 72);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => { setPanel(null); }, [pathname]);
  useEffect(() => {
    if (!signedIn && (panel === "space" || panel === "learning")) {
      setPanel(null);
      setVisiblePanel(null);
    }
  }, [signedIn, panel]);
  useEffect(() => {
    if (panel) return;
    const timer = setTimeout(() => setVisiblePanel(null), 240);
    return () => clearTimeout(timer);
  }, [panel]);
  useEffect(() => {
    if (!content.current || !visiblePanel || visiblePanel === "mobile") return;
    const measure = () => setPanelHeight((content.current?.offsetHeight ?? 0) + 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content.current);
    return () => observer.disconnect();
  }, [visiblePanel, signedIn, isTeacher, isAdmin, error]);
  useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }, []);
  useEffect(() => {
    if (!panel) return;
    const outside = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) setPanel(null); };
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") { setPanel(null); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [panel]);
  async function logout() {
    setLoggingOut(true); setError("");
    try { await signOut(); close(); router.push("/"); }
    catch { setError("No pudimos cerrar la sesión. Intenta nuevamente."); }
    finally { setLoggingOut(false); }
  }
  function dropdownButton(next: Panel, label: string) {
    return <button className={styles.navLink} aria-expanded={panel === next} aria-controls={`nav-${next}`}
      onPointerEnter={event => hover(next, event.currentTarget)}
      onClick={event => activate(next, event.currentTarget, event.detail)}
      onKeyDown={event => keyboardOpen(event, next)}>{label}<Chevron /></button>;
  }
  const spaceLinks = [
    { href: "/perfil", title: "Mi perfil", detail: "Tu cuenta y tu recorrido" },
    { href: "/mis-cursos", title: "Mis cursos", detail: "Continúa donde lo dejaste" },
    { href: "/notificaciones", title: "Notificaciones", detail: noLeidas ? `${noLeidas} novedades sin leer` : "Novedades de tus cursos" },
    ...(isTeacher ? [{ href: "/profesor", title: "Espacio docente", detail: "Gestiona tus cursos" }] : []),
    ...(isAdmin ? [{ href: "/admin", title: "Administración", detail: "Gestiona la plataforma" }] : []),
  ];
  const learningCards = <div className={styles.learningCards}>
    <Link href="/mis-cursos" className={styles.learningCard} onClick={close}><img src="/developer.svg" alt="" className={styles.cardImage} /><span className={styles.cardCaption}><span className={styles.cardEyebrow}>SIGUE AVANZANDO</span><strong>Mis cursos <ArrowRight size={16} aria-hidden="true" /></strong><small>Retoma lo que empezaste, a tu ritmo.</small></span></Link>
    <Link href="/perfil" className={`${styles.learningCard} ${styles.profileCard}`} onClick={close}><img src="/grades.svg" alt="" className={styles.cardImage} /><span className={styles.cardCaption}><span className={styles.cardEyebrow}>TU RECORRIDO</span><strong>Mi progreso <ArrowRight size={16} aria-hidden="true" /></strong><small>Consulta tu recorrido y tus certificaciones.</small></span></Link>
  </div>;
  const accountLinks = <>
    <div className={styles.accountHeading}><span className={styles.avatar} aria-hidden="true">{(user?.givenName || user?.name || "C").slice(0, 1)}</span><span><strong>{signedIn ? user?.givenName || user?.name || "Mi cuenta" : "Tu espacio personal"}</strong><small>{signedIn ? user?.email : "Aprende. Avanza. Certifícate."}</small></span></div>
    <div className={styles.accountLinks}>{spaceLinks.map(link => <Link href={link.href} key={link.href} onClick={close} aria-current={pathname === link.href ? "page" : undefined}><span><strong>{link.title}</strong><small>{link.detail}</small></span>{link.href === "/notificaciones" && noLeidas > 0 ? <span className={styles.unread}>{noLeidas > 99 ? "99+" : noLeidas}</span> : <ArrowRight size={14} aria-hidden="true" />}</Link>)}</div>
    <div className={styles.session}>{signedIn ? <button onClick={() => void logout()} disabled={loggingOut}>{loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}<ArrowRight size={14} aria-hidden="true" /></button> : <Link href="/login" onClick={close}>Entrar con Google <ArrowRight size={14} aria-hidden="true" /></Link>}</div>
    {error && <p className={styles.error} role="alert">{error}</p>}
  </>;
  return <header ref={header} className={`${styles.header} ${home && !scrolled ? styles.immersive : ""} ${panel ? styles.expanded : ""}`}
    onPointerEnter={cancelClose} onPointerLeave={deferClose}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close(); }}>
    <Link href="/" className={styles.brand} aria-label="Certifika2 - Inicio" aria-current={home ? "page" : undefined} onPointerEnter={close} onClick={close}><Brand /><span className={styles.brandTagline}>ABRE TU SIGUIENTE CAPÍTULO</span></Link>
    <nav ref={nav} className={styles.nav} aria-label="Navegación principal">
      <span className={styles.navIndicator} data-visible={Boolean(panel && panel !== "mobile")} style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }} aria-hidden="true" />
      {dropdownButton("explore", "Explorar")}
      {signedIn ? dropdownButton("learning", "Mi aprendizaje") : <Link href="/#como-funciona" className={styles.navLink} onPointerEnter={close} onClick={close}>Cómo funciona</Link>}
      <Link href={isTeacher ? "/profesor" : "/postular-profesor"} className={styles.navLink} onPointerEnter={close}>{isTeacher ? "Enseñar" : "Quiero enseñar"}</Link>
      {signedIn && dropdownButton("space", "Mi espacio")}
    </nav>
    <div className={styles.actions}>
      {signedIn ? <button className={styles.account} aria-label="Abrir mi cuenta" aria-expanded={panel === "space"} aria-controls="nav-space" onPointerEnter={event => hover("space", event.currentTarget)} onClick={event => activate("space", event.currentTarget, event.detail)} onKeyDown={event => keyboardOpen(event, "space")}><span className={styles.avatar} aria-hidden="true">{(user?.givenName || user?.name || "C").slice(0, 1)}</span><span className={styles.accountName}>{user?.givenName || "Mi cuenta"}</span>{noLeidas > 0 && <span className={styles.notificationDot} aria-label={`${noLeidas} notificaciones sin leer`} />}<Chevron /></button>
        : <Link href="/login" className={styles.login} onPointerEnter={close}><span className={styles.loginFull}>Entrar con Google</span><span className={styles.loginShort}>Entrar</span><ArrowRight size={15} aria-hidden="true" /></Link>}
      <button className={styles.mobileToggle} aria-label={panel === "mobile" ? "Cerrar navegación" : "Abrir navegación"} aria-expanded={panel === "mobile"} aria-controls="nav-mobile" onClick={event => panel === "mobile" ? close() : open("mobile", event.currentTarget)}><span /><span /></button>
    </div>
    {visiblePanel && visiblePanel !== "mobile" && <div className={`${styles.dropdown} ${styles.desktopDropdown}`} data-panel={visiblePanel} data-open={Boolean(panel)} inert={!panel} aria-hidden={!panel} style={{ "--panel-height": `${panelHeight}px` } as CSSProperties}>
      <div className={styles.surface}><div ref={content} className={styles.desktopContent} key={visiblePanel}>
        {visiblePanel === "explore" && <div id="nav-explore" className={styles.exploreSurface}>
      <div className={styles.areaList}><p className={styles.kicker}>ENCUENTRA TU CAMINO</p>{AREAS.map(area => <Link href={`/cursos?area=${area.id}`} key={area.id} className={`${styles.areaLink} ${activeArea.id === area.id ? styles.activeArea : ""}`} onPointerEnter={() => setActiveArea(area)} onFocus={() => setActiveArea(area)} onClick={close}><strong>{area.name}</strong><small>{area.tagline}</small></Link>)}<Link href="/cursos" className={styles.catalogLink} onClick={close}>Ver todos los cursos <ArrowRight size={15} aria-hidden="true" /></Link></div>
      <Link href={`/cursos?area=${activeArea.id}`} className={styles.areaPreview} onClick={close}><span className={styles.previewLabel}>EXPLORA LO QUE VIENE</span><div className={styles.previewArtwork}>{AREAS.map(area => <div className={styles.artLayer} data-active={activeArea.id === area.id} key={area.id}><AreaArtwork areaId={area.id} /></div>)}</div><span className={styles.previewCaption}><span className={styles.previewCopy} key={activeArea.id}><strong>{activeArea.name}</strong><small>{activeArea.tagline}</small></span><span>Descubrir el área <ArrowRight size={16} aria-hidden="true" /></span></span></Link>
        </div>}
        {visiblePanel === "learning" && signedIn && <div id="nav-learning">{learningCards}</div>}
        {visiblePanel === "space" && signedIn && <div id="nav-space" className={styles.accountSurface}>{accountLinks}</div>}
      </div></div>
    </div>}
    {visiblePanel === "mobile" && <div id="nav-mobile" className={`${styles.dropdown} ${styles.mobileDropdown}`} data-open={panel === "mobile"} inert={panel !== "mobile"} aria-hidden={panel !== "mobile"}><nav className={`${styles.surface} ${styles.mobileSurface}`} aria-label="Navegación móvil"><Link href="/#como-funciona" className={styles.mobileHome} onClick={close}>Cómo funciona <ArrowRight size={16} aria-hidden="true" /></Link><p className={styles.kicker}>EXPLORAR</p><div className={styles.mobileAreas}>{AREAS.map(area => <Link href={`/cursos?area=${area.id}`} key={area.id} onClick={close}>{area.name}<ArrowRight size={13} aria-hidden="true" /></Link>)}</div><Link href="/cursos" className={styles.catalogLink} onClick={close}>Ver todos los cursos <ArrowRight size={15} aria-hidden="true" /></Link>{signedIn && <><p className={styles.kicker}>MI APRENDIZAJE</p>{learningCards}{accountLinks}</>}<Link href={isTeacher ? "/profesor" : "/postular-profesor"} className={styles.teachLink} onClick={close}>{isTeacher ? "Espacio docente" : "Quiero enseñar"}<ArrowRight size={14} aria-hidden="true" /></Link></nav></div>}
  </header>;
}

