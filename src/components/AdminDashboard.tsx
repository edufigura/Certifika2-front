"use client";

import { useCallback, useEffect, useState } from "react";
import RoleGate from "@/components/RoleGate";
import QueueDeliveryMonitor from "@/components/QueueDeliveryMonitor";
import CertificateDemoMonitor from "@/components/CertificateDemoMonitor";
import {
  getTeacherApplications,
  reviewTeacherApplication,
  subscribeToTeacherApplications,
  type TeacherApplication,
  type TeacherApplicationStatus,
} from "@/lib/teacherApplications";

type GatewayStats = {
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  averageLatencyMs: number;
};

type ApiRoute = {
  id: number;
  name: string;
  pathPattern: string;
  targetUrl: string;
  enabled: boolean;
  rateLimitPerMinute: number;
};

function AdminWorkspace() {
  const [stats, setStats] = useState<GatewayStats | null>(null);
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [applicationError, setApplicationError] = useState("");
  const [applicationLoading, setApplicationLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [applicationFilter, setApplicationFilter] = useState<TeacherApplicationStatus | "ALL">("PENDING");

  const load = useCallback(async () => {
    setFailed(false);
    const [statsResponse, routesResponse] = await Promise.all([
      fetch("/api/bff/admin/logs/stats", { credentials: "include", cache: "no-store" }),
      fetch("/api/bff/admin/routes", { credentials: "include", cache: "no-store" }),
    ]);
    if (!statsResponse.ok || !routesResponse.ok) {
      throw new Error(`HTTP ${statsResponse.status}/${routesResponse.status}`);
    }
    setStats((await statsResponse.json()) as GatewayStats);
    setRoutes((await routesResponse.json()) as ApiRoute[]);
  }, []);

  useEffect(() => {
    load().catch(() => setFailed(true)).finally(() => setLoading(false));
  }, [load]);

  const loadApplications = useCallback(async () => {
    try { setApplications(await getTeacherApplications()); setApplicationError(""); }
    catch (error) { setApplicationError(error instanceof Error ? error.message : "No se pudieron cargar las postulaciones."); }
    finally { setApplicationLoading(false); }
  }, []);
  useEffect(() => {
    void loadApplications();
    return subscribeToTeacherApplications(() => void loadApplications());
  }, [loadApplications]);

  const filteredApplications = applications.filter(
    (application) => applicationFilter === "ALL" || application.status === applicationFilter,
  );

  const applicationCount = (status: TeacherApplicationStatus) =>
    applications.filter((application) => application.status === status).length;

  async function review(id: string, status: "APPROVED" | "REJECTED") {
    setReviewing(id); setApplicationError("");
    try { await reviewTeacherApplication(id, status); await loadApplications(); }
    catch (error) { setApplicationError(error instanceof Error ? error.message : "No se pudo revisar la solicitud."); }
    finally { setReviewing(null); }
  }

  return (
    <div className="container dashboard-stack">
      <QueueDeliveryMonitor />
      <CertificateDemoMonitor />
      <section className="admin-applications">
        <div className="section-head-inline">
          <div>
            <span className="application-eyebrow">Equipo docente</span>
            <h2>Postulaciones de profesores</h2>
            <p className="section-subtitle">Revisa la experiencia de cada candidato y decide su acceso.</p>
          </div>
          <div><span className="pending-count">{applicationCount("PENDING")} pendientes</span>
            <button className="btn btn--secondary btn--sm" onClick={() => void loadApplications()}>Actualizar postulaciones</button></div>
        </div>

        <div className="application-admin-summary" aria-label="Resumen de postulaciones">
          <button className={applicationFilter === "PENDING" ? "summary-card summary-card--active" : "summary-card"}
            onClick={() => setApplicationFilter("PENDING")}>
            <span>Pendientes</span><strong>{applicationCount("PENDING")}</strong>
          </button>
          <button className={applicationFilter === "APPROVED" ? "summary-card summary-card--active" : "summary-card"}
            onClick={() => setApplicationFilter("APPROVED")}>
            <span>Aprobadas</span><strong>{applicationCount("APPROVED")}</strong>
          </button>
          <button className={applicationFilter === "REJECTED" ? "summary-card summary-card--active" : "summary-card"}
            onClick={() => setApplicationFilter("REJECTED")}>
            <span>Rechazadas</span><strong>{applicationCount("REJECTED")}</strong>
          </button>
          <button className={applicationFilter === "ALL" ? "summary-card summary-card--active" : "summary-card"}
            onClick={() => setApplicationFilter("ALL")}>
            <span>Total</span><strong>{applications.length}</strong>
          </button>
        </div>

        {applicationError && <p role="alert" className="auth-alert">{applicationError}</p>}
        {applicationLoading ? <p>Cargando postulaciones reales…</p> : filteredApplications.length ? (
          <div className="application-review-list">
            {filteredApplications.map((application) => (
              <article className="card application-review-card" key={application.id}>
                <div className="application-review-main">
                  <div className="application-review-head">
                    <div className="application-avatar" aria-hidden="true">
                      {application.applicantName.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <h3>{application.applicantName}</h3>
                      <a href={`mailto:${application.applicantEmail}`}>{application.applicantEmail}</a>
                    </div>
                    <span className={`status-badge ${application.status === "APPROVED" ? "status-badge--ok" : ""}`}>
                      {application.status === "PENDING" ? "Pendiente" : application.status === "APPROVED" ? "Aprobada" : "Rechazada"}
                    </span>
                  </div>
                  <div className="application-review-facts">
                    <div><span>Especialidad</span><strong>{application.specialty}</strong></div>
                    <div><span>Experiencia</span><strong>{application.experienceYears} años</strong></div>
                    <div><span>Disponibilidad</span><strong>{application.availability}</strong></div>
                  </div>
                  <div className="application-motivation">
                    <span>Motivación</span>
                    <p>{application.motivation}</p>
                  </div>
                </div>
                <div className="application-review-actions">
                  <a className="btn btn--secondary btn--sm" href={application.profileUrl} target="_blank" rel="noreferrer">
                    Ver perfil
                  </a>
                  {application.status === "PENDING" ? (
                    <>
                      <button className="btn btn--secondary btn--sm btn--danger" disabled={reviewing !== null} onClick={() => void review(application.id, "REJECTED")}>Rechazar</button>
                      <button className="btn btn--primary btn--sm" disabled={reviewing !== null} onClick={() => void review(application.id, "APPROVED")}>{reviewing === application.id ? "Guardando…" : "Aprobar"}</button>
                    </>
                  ) : (
                    <button className="btn btn--secondary btn--sm" onClick={() => setApplicationFilter("PENDING")}>Ver pendientes</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card empty-review-state"><h3>No hay postulaciones en esta categoría</h3><p>Cuando exista una solicitud, aparecerá aquí.</p></div>
        )}
      </section>

      <div className="admin-divider" />
      <div className="section-head-inline">
        <div><h2>Estado del API Manager</h2><p className="section-subtitle">Datos reales registrados por el Gateway.</p></div>
        <button className="btn btn--secondary btn--sm" onClick={() => void load()} disabled={loading}>Actualizar</button>
      </div>
      {failed ? <p className="auth-alert">No se pudieron consultar las métricas administrativas.</p> : null}
      <section className="metrics-grid" aria-label="Métricas del Gateway">
        <article className="card card-pad"><span>Solicitudes</span><strong>{stats?.totalRequests ?? "—"}</strong></article>
        <article className="card card-pad"><span>Correctas</span><strong>{stats?.successRequests ?? "—"}</strong></article>
        <article className="card card-pad"><span>Errores</span><strong>{stats?.errorRequests ?? "—"}</strong></article>
        <article className="card card-pad"><span>Latencia media</span><strong>{stats ? `${stats.averageLatencyMs} ms` : "—"}</strong></article>
      </section>
      <section className="card dashboard-table-wrap">
        <table className="dashboard-table">
          <thead><tr><th>Servicio</th><th>Patrón</th><th>Destino privado</th><th>Límite</th><th>Estado</th></tr></thead>
          <tbody>{routes.map((route) => (
            <tr key={route.id}><td>{route.name}</td><td><code>{route.pathPattern}</code></td><td><code>{route.targetUrl}</code></td>
              <td>{route.rateLimitPerMinute}/min</td><td><span className={route.enabled ? "status-badge status-badge--ok" : "status-badge"}>{route.enabled ? "Activo" : "Inactivo"}</span></td></tr>
          ))}</tbody>
        </table>
      </section>
    </div>
  );
}

export default function AdminDashboard() {
  return <RoleGate roles={["ADMIN"]}><AdminWorkspace /></RoleGate>;
}
