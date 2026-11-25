"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AREAS, COURSES, getAreaById } from "@/lib/data";
import CourseCard from "@/components/CourseCard";
import { useSession } from "@/lib/auth";
import { courseFromBackend, type BackendCourse } from "@/lib/backendCourses";

export default function CourseExplorer() {
  const searchParams = useSearchParams();
  const { signedIn } = useSession();
  const [backendCourses, setBackendCourses] = useState<BackendCourse[]>([]);
  const [query, setQuery] = useState("");
  const activeArea = getAreaById(searchParams.get("area") ?? "");
  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/bff/cursos", { credentials: "include", cache: "no-store" })
      .then(response => response.ok ? response.json() as Promise<BackendCourse[]> : Promise.reject())
      .then(setBackendCourses)
      .catch(() => setBackendCourses([]));
  }, [signedIn]);

  const catalog = useMemo(() => {
    const merged = new Map(COURSES.map(course => [course.id, course]));
    backendCourses.forEach(course => {
      if (!merged.has(course.codigo)) merged.set(course.codigo, courseFromBackend(course));
    });
    return [...merged.values()];
  }, [backendCourses]);
  const normalizedQuery = query.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const filtered = catalog.filter(course => {
    const matchesArea = !activeArea || course.areaId === activeArea.id;
    const searchable = `${course.title} ${course.summary}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return matchesArea && searchable.includes(normalizedQuery);
  });

  return <>
    <section className="page-head catalog-head"><div className="container">
      <p className="eyebrow">TU CURIOSIDAD TIENE UN LUGAR</p>
      <h1 className="page-title">{activeArea ? activeArea.name : <>Encuentra tu<br /><em>siguiente paso.</em></>}</h1>
      <p className="page-subtitle">{activeArea ? activeArea.description : "Nuevas herramientas, nuevas ideas, nuevas posibilidades. ¿Qué quieres aprender hoy?"}</p>
    </div></section>
    <section className="section" style={{ paddingTop: 0 }}><div className="container">
      <div className="catalog-toolbar"><div className="filters" aria-label="Filtrar por área">
        <Link href="/cursos" aria-current={!activeArea ? "page" : undefined} className={`filter-chip ${!activeArea ? "filter-chip--active" : ""}`}>Todas las áreas</Link>
        {AREAS.map(area => <Link key={area.id} href={`/cursos?area=${area.id}`} aria-current={activeArea?.id === area.id ? "page" : undefined} className={`filter-chip ${activeArea?.id === area.id ? "filter-chip--active" : ""}`}>{area.name}</Link>)}
      </div><label className="catalog-search"><span>Buscar un curso</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nombre o tema…" /></label></div>
      <div className="catalog-results"><h2>{activeArea ? "Explora esta área" : "Elige tu próximo curso"}</h2><span aria-live="polite">{filtered.length} {filtered.length === 1 ? "curso disponible" : "cursos disponibles"}</span></div>
      {filtered.length ? <div className="courses-grid">{filtered.map(course => <CourseCard key={course.id} course={course} />)}</div> : <div className="empty-state"><span className="empty-state-icon">↗</span><h2>Hay otros caminos por explorar</h2><p>No encontramos cursos con esa búsqueda. Prueba con otro tema o área.</p><button className="btn btn--secondary" onClick={() => setQuery("")}>Limpiar búsqueda</button></div>}
    </div></section>
  </>;
}
