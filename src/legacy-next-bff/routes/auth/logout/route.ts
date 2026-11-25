// Respaldo temporal del antiguo BFF Next.js; no forma parte del App Router.
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  getClientId,
  getDomain,
  getLogoutUri,
  isCognitoConfigured,
} from "@/lib/cognito";
import { deleteServerSession } from "@/lib/session-store";

/** Elimina la sesión local y devuelve la URL de cierre de sesión de Cognito. */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Origen no permitido" }, { status: 403 });
  }
  const cookieStore = await cookies();
  deleteServerSession(cookieStore.get(SESSION_COOKIE)?.value);
  cookieStore.delete(SESSION_COOKIE);
  if (!isCognitoConfigured()) return Response.json({ signedIn: false });

  const logoutUrl = new URL(`${getDomain()}/logout`);
  logoutUrl.searchParams.set("client_id", getClientId());
  logoutUrl.searchParams.set("logout_uri", getLogoutUri(request));
  return Response.json({ signedIn: false, logoutUrl: logoutUrl.toString() });
}
