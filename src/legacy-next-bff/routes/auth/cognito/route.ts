// Respaldo temporal del antiguo BFF Next.js; no forma parte del App Router.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  NONCE_COOKIE,
  OIDC_SCOPES,
  SHORT_COOKIE_OPTIONS,
  STATE_COOKIE,
  VERIFIER_COOKIE,
  codeChallengeFromVerifier,
  getClientId,
  getDomain,
  getRedirectUri,
  isCognitoConfigured,
  randomUrlSafeString,
} from "@/lib/cognito";

export async function GET(request: Request) {
  if (!isCognitoConfigured()) redirect("/login?error=not_configured");

  const state = randomUrlSafeString();
  const nonce = randomUrlSafeString();
  const verifier = randomUrlSafeString(48);
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, SHORT_COOKIE_OPTIONS);
  cookieStore.set(NONCE_COOKIE, nonce, SHORT_COOKIE_OPTIONS);
  cookieStore.set(VERIFIER_COOKIE, verifier, SHORT_COOKIE_OPTIONS);

  const authorizationUrl = new URL(`${getDomain()}/oauth2/authorize`);
  authorizationUrl.searchParams.set("client_id", getClientId());
  authorizationUrl.searchParams.set("redirect_uri", getRedirectUri(request));
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", OIDC_SCOPES);
  authorizationUrl.searchParams.set("identity_provider", "Google");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("nonce", nonce);
  authorizationUrl.searchParams.set(
    "code_challenge",
    codeChallengeFromVerifier(verifier),
  );
  authorizationUrl.searchParams.set("code_challenge_method", "S256");
  redirect(authorizationUrl.toString());
}
