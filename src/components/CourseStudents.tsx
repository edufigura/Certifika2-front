"use client";

import { useCallback, useEffect, useState } from "react";
import { certificateRequest } from "@/lib/certificates";

type Enrollment = { idUsuario: string; estaInscrito: boolean; fechaCompletado: string | null };
export default function CourseStudents({ courseCode }: { courseCode: string }) {
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const base = `cursos/codigo/${encodeURIComponent(courseCode)}/estudiantes`;
  const reload = useCallback(async () => {
    try { setStudents((await certificateRequest<Enrollment[]>(base)).filter(item => item.estaInscrito)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudieron cargar los estudiantes."); }
    finally { setLoading(false); }
  }, [base]);
  useEffect(() => { void reload(); }, [reload]);
  async function action(sub: string, operation: "completar" | "certificado") {
    setBusy(true); setMessage("");
    try {
      await certificateRequest(`${base}/${encodeURIComponent(sub)}/${operation}${operation === "certificado" ? "?formato=PDF" : ""}`, { method: "POST" });
      setMessage(operation === "completar" ? "Finalización registrada." : "Emisión solicitada. El estudiante podrá descargar el certificado desde su perfil.");
      await reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo completar la operación."); }
    finally { setBusy(false); }
  }
  return <section style={{ marginTop: 20 }}><h4>Estudiantes y certificados</h4>
    {loading ? <p>Cargando estudiantes…</p> : !students.length ? <p className="auth-note">Aún no hay estudiantes inscritos.</p> : students.map((student, index) =>
      <div key={student.idUsuario} style={{ padding: "12px 0", borderBottom: "1px solid #e1e7f2" }}>
        <p><strong>Estudiante {index + 1}</strong> · {student.fechaCompletado ? "Curso finalizado" : "En curso"}</p>
        <details className="auth-note"><summary>Identificador de la cuenta</summary>{student.idUsuario}</details>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button type="button" className="btn btn--secondary btn--sm" disabled={busy || !!student.fechaCompletado} onClick={() => void action(student.idUsuario, "completar")}>Marcar finalizado</button>
          <button type="button" className="btn btn--primary btn--sm" disabled={busy || !student.fechaCompletado} onClick={() => void action(student.idUsuario, "certificado")}>Emitir PDF</button>
        </div>
      </div>)}
    {message && <p role="status" className="auth-note">{message}</p>}
  </section>;
}
