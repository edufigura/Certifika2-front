// Respaldo temporal del antiguo BFF Next.js; no forma parte del App Router.
import { isCognitoConfigured } from "@/lib/cognito";
import { getSession } from "@/lib/session";

/** Sesión actual, leída del JWT de la cookie. La consume el store del cliente. */
export async function GET() {
  const session = await getSession();

  return Response.json(
    {
      signedIn: Boolean(session),
      user: session?.user ?? null,
      expiresAt: session?.expiresAt ?? null,
      configured: isCognitoConfigured(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
