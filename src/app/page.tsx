import type { Metadata } from "next";
import Link from "next/link";
import { getTopCourses } from "@/lib/data";
import CourseCard from "@/components/CourseCard";
import TeacherRoadmap from "@/components/TeacherRoadmap";
import Hero from "@/components/Hero";
import CourseCarousel from "@/components/CourseCarousel";
import LearningRoadmap from "@/components/LearningRoadmap";
import JourneyConnection from "@/components/JourneyConnection";
import { PlatformQuestions } from "@/components/PlatformStory";

export const metadata: Metadata = { title: "Certifika2 — Tu próximo nivel empieza aquí" };

export default function HomePage() {
  return <>
    <Hero />
    <JourneyConnection />
    <LearningRoadmap />
    <section className="section section--tint"><div className="container">
      <div className="section-head"><div><p className="eyebrow">CURSOS / DA EL SIGUIENTE PASO</p><h2 className="section-title">Empieza con algo grande.</h2><p className="section-subtitle">Una selección de cursos para poner tus ideas en movimiento.</p></div><Link href="/cursos" className="section-link">Ver todos los cursos ↗</Link></div>
      <CourseCarousel>{getTopCourses().map(course => <CourseCard key={course.id} course={course} />)}</CourseCarousel>
    </div></section>
    <PlatformQuestions />
    <TeacherRoadmap />
  </>;
}
