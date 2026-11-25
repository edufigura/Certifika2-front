import { createPublicKey, createVerify } from "node:crypto";
import { base64UrlDecode } from "@/lib/base64url";

export type JwtHeader = {
  alg: string;
  kid?: string;
  typ?: string;
};

export type JwtClaims = Record<string, unknown> & {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  exp?: number;
  iat?: number;
  nonce?: string;
};

export function decodeJwt(token: string): { header: JwtHeader; claims: JwtClaims } {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("JWT malformado");
  return {
    header: JSON.parse(base64UrlDecode(parts[0]).toString("utf8")) as JwtHeader,
    claims: JSON.parse(base64UrlDecode(parts[1]).toString("utf8")) as JwtClaims,
  };
}

// ---------------------------------------------------------------------------
// RS256 — verificación contra el JWKS rotativo de Cognito
// ---------------------------------------------------------------------------

type Jwk = { kid?: string; alg?: string; kty?: string; n?: string; e?: string };

const JWKS_TTL_MS = 60 * 60 * 1000;

const jwksCache = new Map<string, { keys: Jwk[]; fetchedAt: number }>();

async function getJwks(jwksUri: string, forceRefresh = false): Promise<Jwk[]> {
  const cached = jwksCache.get(jwksUri);
  const fresh =
    cached && !forceRefresh && Date.now() - cached.fetchedAt < JWKS_TTL_MS;
  if (fresh) return cached.keys;

  const response = await fetch(jwksUri, { cache: "no-store" });
  if (!response.ok) throw new Error("No se pudo obtener el JWKS del emisor");

  const body = (await response.json()) as { keys?: Jwk[] };
  if (!body.keys?.length) throw new Error("JWKS del emisor vacío");

  jwksCache.set(jwksUri, { keys: body.keys, fetchedAt: Date.now() });
  return body.keys;
}

export async function verifyJwtSignature(
  token: string,
  jwksUri: string,
): Promise<JwtClaims> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("JWT malformado");

  const { header, claims } = decodeJwt(token);
  if (header.alg !== "RS256") throw new Error(`alg no soportado: ${header.alg}`);

  const signingInput = `${parts[0]}.${parts[1]}`;
  const signature = base64UrlDecode(parts[2]);

  for (const forceRefresh of [false, true]) {
    const keys = await getJwks(jwksUri, forceRefresh);
    const jwk = keys.find((key) => key.kid === header.kid);
    if (!jwk) continue;

    const publicKey = createPublicKey({ key: jwk as never, format: "jwk" });
    const verified = createVerify("RSA-SHA256")
      .update(signingInput)
      .verify(publicKey, signature);

    if (!verified) throw new Error("Firma del JWT inválida");
    return claims;
  }

  throw new Error(`No hay clave pública para el kid ${header.kid ?? "(ausente)"}`);
}

export function assertNotExpired(claims: JwtClaims, leewaySeconds = 30) {
  if (typeof claims.exp !== "number") throw new Error("Falta el claim exp");
  if (claims.exp + leewaySeconds < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expirado");
  }
}
