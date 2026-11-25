"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function ExploreSection({ children }: { children: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = section.current!;
    if (!("IntersectionObserver" in window)) return;
    root.dataset.entrance = "pending";
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        root.dataset.entrance = "visible";
        observer.disconnect();
      }
    }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });
    observer.observe(root);
    return () => {
      observer.disconnect();
      delete root.dataset.entrance;
    };
  }, []);

  useEffect(() => {
    const root = section.current!;
    const panel = stage.current!;
    const grid = root.querySelector<HTMLElement>(".areas-grid")!;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".area-card"));
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let travel = 0;
    let carouselWidth = 0;
    let gap = 16;
    let trackDistance = 0;
    let targets: { x: number; y: number; width: number; height: number }[] = [];
    const reset = () => {
      delete root.dataset.scrollCarousel;
      root.style.height = "";
      grid.style.height = "";
      cards.forEach(card => { card.style.width = ""; card.style.height = ""; card.style.transform = ""; card.style.transition = ""; });
    };
    const paint = () => {
      frame = 0;
      if (!root.hasAttribute("data-scroll-carousel")) return;
      const padding = parseFloat(getComputedStyle(root).paddingTop);
      const progress = Math.max(0, Math.min(1, (100 - root.getBoundingClientRect().top - padding) / travel));
      const horizontal = Math.min(1, progress / .72);
      const fold = Math.max(0, (progress - .72) / .28);
      const blend = fold * fold * (3 - 2 * fold);
      root.style.setProperty("--explore-progress", String(progress));
      cards.forEach((card, index) => {
        const target = targets[index];
        const startX = index * (carouselWidth + gap) - horizontal * trackDistance;
        const x = startX + (target.x - startX) * blend;
        card.style.width = `${carouselWidth + (target.width - carouselWidth) * blend}px`;
        card.style.height = `${target.height}px`;
        card.style.transform = `translate3d(${x}px, ${target.y * blend}px, 0)`;
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const measure = () => {
      reset();
      if (preference.matches) return;
      gap = parseFloat(getComputedStyle(grid).columnGap) || 16;
      targets = cards.map(card => ({ x: card.offsetLeft, y: card.offsetTop, width: card.offsetWidth, height: card.offsetHeight }));
      const gridHeight = grid.offsetHeight;
      carouselWidth = Math.min(grid.clientWidth * .85, Math.max(300, targets[0].width));
      trackDistance = Math.max(0, cards.length * (carouselWidth + gap) - gap - grid.clientWidth);
      travel = Math.max(1000, trackDistance * .9) / .72;
      root.dataset.scrollCarousel = "true";
      grid.style.height = `${gridHeight}px`;
      cards.forEach(card => { card.style.transition = "border-color .2s"; });
      const style = getComputedStyle(root);
      root.style.height = `${panel.offsetHeight + travel + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)}px`;
      paint();
    };
    // Keyboard users can immediately reach the complete, stationary grid.
    const onFocus = () => { reset(); };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    preference.addEventListener("change", measure);
    grid.addEventListener("focusin", onFocus);
    let disposed = false;
    document.fonts.ready.then(() => { if (!disposed) measure(); });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      preference.removeEventListener("change", measure);
      grid.removeEventListener("focusin", onFocus);
      reset();
    };
  }, []);

  return <section ref={section} className="section explore-section">
    <div ref={stage} className="explore-stage">
      <div className="container explore-scroll-hint" aria-hidden="true"><span>Desliza para explorar todas las áreas ↓</span><span className="explore-scroll-progress" /></div>
      {children}
    </div>
  </section>;
}
