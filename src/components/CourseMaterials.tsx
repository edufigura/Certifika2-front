"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth";

export type CourseMaterial = {
  idMaterial: number;
  titulo: string;
  tipo: string;
  url: string;
  fechaCreacion: string;
};

export default function CourseMaterials({ courseCode }: { courseCode: string }) {
  const { signedIn, loading: sessionLoading } = useSession();
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!signedIn) {
      setLoading(false);
      return;
    }
    fetch(`/api/bff/cursos/codigo/${encodeURIComponent(courseCode)}/materiales`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((response) => response.ok ? response.json() as Promise<CourseMaterial[]> : Promise.reject())
      .then(setMaterials)
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false));
  }, [courseCode, sessionLoading, signedIn]);

  if (!signedIn && !sessionLoading) {
    return <p className="page-subtitle">Inicia sesión para consultar el material complementario.</p>;
  }
  if (loading) return <p className="page-subtitle">Cargando material…</p>;
  if (!materials.length) return <p className="page-subtitle">El profesor todavía no ha publicado material.</p>;

  return (
    <div className="material-list">
      {materials.map((material) => (
        <a key={material.idMaterial} href={material.url} target="_blank" rel="noreferrer">
          <span className="material-type">{material.tipo}</span>
          <strong>{material.titulo}</strong>
          <span>Abrir recurso ↗</span>
        </a>
      ))}
    </div>
  );
}
