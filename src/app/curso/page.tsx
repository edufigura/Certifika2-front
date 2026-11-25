import type { Metadata } from "next";
import { Suspense } from "react";
import DynamicCourseDetail from "@/components/DynamicCourseDetail";

export const metadata: Metadata = { title: "Curso" };

export default function CursoDinamicoPage() {
  return <Suspense fallback={<div className="container section">Cargando curso…</div>}><DynamicCourseDetail /></Suspense>;
}
