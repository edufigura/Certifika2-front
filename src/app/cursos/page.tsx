import type { Metadata } from "next";
import { Suspense } from "react";
import CourseExplorer from "@/components/CourseExplorer";

export const metadata: Metadata = {
  title: "Explorar cursos",
};

export default function CursosPage() {
  return (
    <Suspense fallback={<div className="container section">Cargando cursos…</div>}>
      <CourseExplorer />
    </Suspense>
  );
}
