"use client";

import { useEffect, useState } from "react";
import type { Course } from "@/lib/data";
import { courseFromBackend, type BackendCourse } from "@/lib/backendCourses";
import { useSession } from "@/lib/auth";

export function useEnrolledCourses() {
  const { signedIn, loading: sessionLoading } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => { const refresh = () => setRevision(value => value + 1); window.addEventListener("certifika2:enrollments-change", refresh); return () => window.removeEventListener("certifika2:enrollments-change", refresh); }, []);

  useEffect(() => {
    if (sessionLoading) return;
    if (!signedIn) {
      setCourses([]);
      setLoading(false);
      return;
    }

    let active = true;
    setFailed(false);
    fetch("/api/bff/cursos/mis-cursos", {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return (await response.json()) as BackendCourse[];
      })
      .then((items) => {
        if (!active) return;
        setCourses(
          items.map(courseFromBackend),
        );
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, signedIn, revision]);

  return {
    courses,
    failed,
    loading: sessionLoading || loading,
    signedIn,
  };
}
