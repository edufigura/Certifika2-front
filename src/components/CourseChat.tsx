"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useEnrolledCourses } from "@/lib/enrollments";

type ChatMessage = {
  idMensaje: number;
  idCurso: string;
  idUsuarioEmisor: string;
  nombreEmisor: string;
  contenido: string;
  fechaEnvio: string;
};

export default function CourseChat({ courseCode }: { courseCode: string }) {
  const { courses, loading: enrollmentsLoading, signedIn } = useEnrolledCourses();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const enrolled = courses.some((course) => course.id === courseCode);

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/bff/chat/historial/${encodeURIComponent(courseCode)}`,
        { cache: "no-store", credentials: "include" },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setMessages((await response.json()) as ChatMessage[]);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [courseCode]);

  useEffect(() => {
    if (!signedIn || enrollmentsLoading || !enrolled) return;
    void loadMessages();
    const poll = window.setInterval(() => void loadMessages(), 5000);
    return () => window.clearInterval(poll);
  }, [signedIn, enrollmentsLoading, enrolled, loadMessages]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setFailed(false);
    try {
      const response = await fetch(
        `/api/bff/chat/curso/${encodeURIComponent(courseCode)}/mensajes`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contenido: trimmed }),
        },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const message = (await response.json()) as ChatMessage;
      setMessages((current) =>
        current.some((item) => item.idMensaje === message.idMensaje)
          ? current
          : [...current, message],
      );
      setContent("");
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  if (!signedIn || enrollmentsLoading || !enrolled) return null;

  return (
    <section className="course-chat" aria-labelledby="course-chat-title">
      <div className="section-head-inline">
        <div>
          <h2 id="course-chat-title">Chat del curso</h2>
          <p className="page-subtitle">Conversación entre estudiantes y profesores.</p>
        </div>
      </div>

      <div className="chat-history" aria-live="polite">
        {loading ? (
          <p>Cargando conversación…</p>
        ) : messages.length ? (
          messages.map((message) => (
            <article className="chat-message" key={message.idMensaje}>
              <div className="chat-message-head">
                <strong>{message.nombreEmisor}</strong>
                <time dateTime={message.fechaEnvio}>
                  {new Date(message.fechaEnvio).toLocaleString("es-CL", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p>{message.contenido}</p>
            </article>
          ))
        ) : (
          <p>Todavía no hay mensajes. Inicia la conversación.</p>
        )}
      </div>

      <form className="chat-form" onSubmit={sendMessage}>
        <label htmlFor={`chat-${courseCode}`}>Mensaje</label>
        <textarea
          id={`chat-${courseCode}`}
          value={content}
          maxLength={2000}
          rows={3}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Escribí un mensaje para el curso…"
        />
        <button
          type="submit"
          className="btn btn--primary"
          disabled={sending || !content.trim()}
        >
          {sending ? "Enviando…" : "Enviar mensaje"}
        </button>
      </form>
      {failed ? <p className="auth-alert">No se pudo actualizar el chat.</p> : null}
    </section>
  );
}
