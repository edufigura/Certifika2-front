export type TeacherApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type TeacherApplication = {
  id: string; applicantId: string; applicantName: string; applicantEmail: string;
  specialty: string; experienceYears: number; profileUrl: string; motivation: string;
  availability: string; status: TeacherApplicationStatus; createdAt: string; reviewedAt?: string;
};
export type TeacherApplicationInput = Pick<TeacherApplication,
  "specialty" | "experienceYears" | "profileUrl" | "motivation" | "availability">;
const BASE = "/api/bff/usuarios/postulaciones";
const CHANGE_EVENT = "certifika2:teacher-applications-change";
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(BASE + path, { credentials: "include", cache: "no-store", ...options });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(detail.error || `No se pudo completar la operación (HTTP ${response.status}).`);
  }
  return response.status === 204 ? null as T : await response.json() as T;
}
export function getTeacherApplications() { return request<TeacherApplication[]>(""); }
export function getMyTeacherApplication() { return request<TeacherApplication | null>("/mia"); }
export async function submitTeacherApplication(input: TeacherApplicationInput) {
  const result = await request<TeacherApplication>("", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  window.dispatchEvent(new Event(CHANGE_EVENT)); return result;
}
export async function reviewTeacherApplication(id: string, status: "APPROVED" | "REJECTED") {
  const result = await request<TeacherApplication>(`/${encodeURIComponent(id)}/revision`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
  });
  window.dispatchEvent(new Event(CHANGE_EVENT)); return result;
}
export function subscribeToTeacherApplications(listener: () => void) {
  retireDemoApplications();
  window.addEventListener(CHANGE_EVENT, listener);
  const timer = window.setInterval(listener, 15000);
  return () => { window.removeEventListener(CHANGE_EVENT, listener); window.clearInterval(timer); };
}
// Remove only the two known demo records. Real legacy drafts remain available to their owner.
function retireDemoApplications() {
  try {
    const key = "certifika2.teacher-applications.v1";
    const old = JSON.parse(window.localStorage.getItem(key) || "[]") as TeacherApplication[];
    if (!Array.isArray(old)) return;
    const kept = old.filter(a => a.id !== "demo-valentina" && a.id !== "demo-matias");
    if (kept.length) window.localStorage.setItem(key, JSON.stringify(kept));
    else window.localStorage.removeItem(key);
  } catch { /* Storage is optional and never the source of real applications. */ }
}
export function legacyDraftForOwner(sub: string): TeacherApplication | undefined {
  retireDemoApplications();
  try {
    const old = JSON.parse(window.localStorage.getItem("certifika2.teacher-applications.v1") || "[]") as TeacherApplication[];
    return Array.isArray(old) ? old.find(a => a.applicantId === sub) : undefined;
  } catch { return undefined; }
}
