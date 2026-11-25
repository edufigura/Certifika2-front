// Respaldo temporal del antiguo BFF Next.js; no forma parte del App Router.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  NONCE_COOKIE,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  STATE_COOKIE,
  VERIFIER_COOKIE,
  exchangeAuthorizationCode,
  getRedirectUri,
  isCognitoConfigured,
} from "@/lib/cognito";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const clearTransient = () => {
    cookieStore.delete(STATE_COOKIE);
    cookieStore.delete(NONCE_COOKIE);
    cookieStore.delete(VERIFIER_COOKIE);
  };

  if (url.searchParams.get("error")) {
    clearTransient();
    redirect("/login?error=access_denied");
  }
  if (!isCognitoConfigured()) redirect("/login?error=not_configured");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  const nonce = cookieStore.get(NONCE_COOKIE)?.value;
  const verifier = cookieStore.get(VERIFIER_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState || !nonce || !verifier) {
    clearTransient();
    redirect("/login?error=invalid_state");
  }

  try {
    const sessionId = await exchangeAuthorizationCode(
      code,
      verifier,
      nonce,
      getRedirectUri(request),
    );
    clearTransient();
    cookieStore.set(SESSION_COOKIE, sessionId, SESSION_COOKIE_OPTIONS);
  } catch (error) {
    console.error(
      "[cognito-callback] Falló el intercambio o la validación:",
      error instanceof Error ? error.message : "Error desconocido",
    );
    clearTransient();
    redirect("/login?error=token_exchange");
  }
  redirect("/perfil");
}
