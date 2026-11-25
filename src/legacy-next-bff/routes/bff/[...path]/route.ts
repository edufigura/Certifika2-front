// Respaldo temporal del antiguo BFF Next.js; no forma parte del App Router.
import { getSessionWithId } from "@/lib/session";
import { refreshAccessToken } from "@/lib/cognito";

const ALLOWED_SERVICES = new Set(["usuarios", "cursos", "chat"]);

function apiManagerUrl(): string {
  return (process.env.API_MANAGER_URL || "http://localhost:8080").replace(/\/$/, "");
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !sameOrigin(request)) {
    return Response.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const { path } = await context.params;
  if (!path?.length || !ALLOWED_SERVICES.has(path[0])) {
    return Response.json({ error: "Servicio no permitido" }, { status: 404 });
  }

  const current = await getSessionWithId();
  if (!current) return Response.json({ error: "No autenticado" }, { status: 401 });

  let session = current.session;
  if (session.accessTokenExpiresAt <= Math.floor(Date.now() / 1000) + 30) {
    try {
      session = await refreshAccessToken(current.sessionId, session);
    } catch {
      return Response.json({ error: "Sesión expirada" }, { status: 401 });
    }
  }

  const incomingUrl = new URL(request.url);
  const safePath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const target = new URL(`${apiManagerUrl()}/api/proxy/${safePath}`);
  target.search = incomingUrl.search;

  const headers = new Headers({
    Authorization: `Bearer ${session.accessToken}`,
    Accept: request.headers.get("accept") || "application/json",
  });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const response = await fetch(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  const responseContentType = response.headers.get("content-type");
  if (responseContentType) responseHeaders.set("Content-Type", responseContentType);
  responseHeaders.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
