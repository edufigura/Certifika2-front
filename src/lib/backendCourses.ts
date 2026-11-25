import { getCourseById, type Course, type CourseLevel } from "@/lib/data";

export type BackendCourse = {
  idCurso: number;
  codigo: string;
  nombreCurso: string;
  nivelCurso?: string;
  descripcion?: string;
};

function level(value?: string): CourseLevel {
  return value === "Intermedio" || value === "Avanzado" ? value : "Básico";
}

export function courseFromBackend(course: BackendCourse): Course {
  return getCourseById(course.codigo) ?? {
    id: course.codigo,
    title: course.nombreCurso,
    areaId: "cloud-devops",
    summary: course.descripcion || "Curso creado desde el panel del profesor.",
    description: course.descripcion || "El profesor publicará la descripción y material del curso.",
    duration: "A definir",
    hours: 0,
    level: level(course.nivelCurso),
    certification: true,
    top: false,
    topics: ["Contenido definido por el profesor"],
  };
}
