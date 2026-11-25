import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { base64UrlEncode } from "@/lib/base64url";
import { assertNotExpired, verifyJwtSignature, type JwtClaims } from "@/lib/jwt";
import {
  createServerSession,
  updateServerSession,
  type ServerSession,
  type SessionUser,
} from "@/lib/session-store";

export const SESSION_COOKIE = "certifika2_cognito_session";
export const STATE_COOKIE = "certifika2_cognito_state";
export const VERIFIER_COOKIE = "certifika2_cognito_verifier";
export const NONCE_COOKIE = "certifika2_cognito_nonce";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;
export const OIDC_SCOPES = "openid email";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta configurar ${name}`);
  return value;
}

export function isCognitoConfigured(): boolean {
  return Boolean(
    process.env.COGNITO_ISSUER_URI &&
      process.env.COGNITO_DOMAIN &&
      process.env.COGNITO_CLIENT_ID &&
      process.env.COGNITO_CLIENT_SECRET,
  );
}

export function getIssuer(): string {
  return required("COGNITO_ISSUER_URI").replace(/\/$/, "");
}

export function getDomain(): string {
  const value = required("COGNITO_DOMAIN").replace(/\/$/, "");
  return value.startsWith("https://") ? value : `https://${value}`;
}

export function getClientId(): string {
  return required("COGNITO_CLIENT_ID");
}

function getClientSecret(): string {
  return required("COGNITO_CLIENT_SECRET");
}

export function getRedirectUri(request: Request): string {
  const configured = process.env.COGNITO_REDIRECT_URI?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("COGNITO_REDIRECT_URI es obligatorio en producción");
  }
  return new URL("/api/auth/cognito/callback", request.url).toString();
}

export function getLogoutUri(request: Request): string {
  const configured = process.env.COGNITO_LOGOUT_URI?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("COGNITO_LOGOUT_URI es obligatorio en producción");
  }
  return new URL("/", request.url).toString();
}

export function randomUrlSafeString(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function codeChallengeFromVerifier(verifier: string): string {
  return base64UrlEncode(createHash("sha256").update(verifier).digest());
}

function groupsFromClaims(claims: JwtClaims): string[] {
  const groups = claims["cognito:groups"];
  return Array.isArray(groups)
    ? groups.filter((group): group is string => typeof group === "string")
    : [];
}

async function verifyCognitoToken(
  token: string,
  tokenUse: "id" | "access",
): Promise<JwtClaims> {
  const issuer = getIssuer();
  const claims = await verifyJwtSignature(token, `${issuer}/.well-known/jwks.json`);
  if (claims.iss !== issuer) throw new Error("Issuer inválido");
  if (claims.token_use !== tokenUse) throw new Error("token_use inválido");
  assertNotExpired(claims);

  if (tokenUse === "id" && claims.aud !== getClientId()) {
    throw new Error("Audience inválida");
  }
  if (tokenUse === "access" && claims.client_id !== getClientId()) {
    throw new Error("client_id inválido");
  }
  return claims;
}

function userFromClaims(claims: JwtClaims): SessionUser {
  const email = typeof claims.email === "string" ? claims.email : "";
  const givenName =
    typeof claims.given_name === "string" ? claims.given_name : undefined;
  const name = typeof claims.name === "string" ? claims.name : undefined;
  if (typeof claims.sub !== "string" || !claims.sub) throw new Error("Falta sub");

  return {
    id: claims.sub,
    name: name || givenName || email || "Usuario",
    givenName,
    email,
    emailVerified: claims.email_verified === true,
    picture: typeof claims.picture === "string" ? claims.picture : undefined,
    groups: groupsFromClaims(claims),
  };
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
};

type CognitoTokenError = {
  error?: string;
  error_description?: string;
};

async function requestTokens(body: URLSearchParams): Promise<TokenResponse> {
  const basic = Buffer.from(`${getClientId()}:${getClientSecret()}`).toString("base64");
  const response = await fetch(`${getDomain()}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  if (!response.ok) {
    let cognitoError: CognitoTokenError = {};
    try {
      cognitoError = (await response.json()) as CognitoTokenError;
    } catch {
      // Cognito normalmente devuelve JSON, pero el diagnóstico no depende de ello.
    }
    const reason = [cognitoError.error, cognitoError.error_description]
      .filter(Boolean)
      .join(": ");
    throw new Error(
      `Cognito token endpoint ${response.status}${reason ? `: ${reason}` : ""}`,
    );
  }
  return (await response.json()) as TokenResponse;
}

export async function exchangeAuthorizationCode(
  code: string,
  verifier: string,
  nonce: string,
  redirectUri: string,
): Promise<string> {
  const tokens = await requestTokens(
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: getClientId(),
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
    }),
  );
  if (!tokens.id_token || !tokens.access_token) {
    throw new Error("Cognito no devolvió los tokens requeridos");
  }

  const idClaims = await verifyCognitoToken(tokens.id_token, "id");
  if (idClaims.nonce !== nonce) throw new Error("Nonce inválido");
  await verifyCognitoToken(tokens.access_token, "access");

  const now = Math.floor(Date.now() / 1000);
  const session: ServerSession = {
    user: userFromClaims(idClaims),
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessTokenExpiresAt: now + (tokens.expires_in ?? 3600),
    sessionExpiresAt: now + SESSION_TTL_SECONDS,
  };
  return createServerSession(session);
}

export async function refreshAccessToken(
  sessionId: string,
  session: ServerSession,
): Promise<ServerSession> {
  if (!session.refreshToken) throw new Error("La sesión no tiene refresh token");
  const tokens = await requestTokens(
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: getClientId(),
      refresh_token: session.refreshToken,
    }),
  );
  if (!tokens.access_token) throw new Error("Cognito no renovó el access token");
  await verifyCognitoToken(tokens.access_token, "access");

  const updated: ServerSession = {
    ...session,
    accessToken: tokens.access_token,
    accessTokenExpiresAt:
      Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 3600),
  };
  updateServerSession(sessionId, updated);
  return updated;
}

export const SHORT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 10,
};

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
