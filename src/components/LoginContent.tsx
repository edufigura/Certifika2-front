"use client";

import { BrandMark } from "./Brand";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CognitoSignInButton from "@/components/CognitoSignInButton";
import { useSession } from "@/lib/auth";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Cancelaste el ingreso. Puedes intentarlo de nuevo.",
  invalid_state:
    "La sesión de autorización expiró o no coincide. Vuelve a intentar el ingreso.",
  token_exchange:
    "No pudimos completar el ingreso con Google. Inténtalo nuevamente.",
};

export default function LoginContent() {
  const searchParams = useSearchParams();
  const { configured, loading } = useSession();
  const error = searchParams.get("error");
  const message = error
    ? ERROR_MESSAGES[error] ?? "No se pudo completar el ingreso."
    : null;

  return (
    <div className="auth-wrap">
      <div className="auth-story"><p className="eyebrow">TU ESPACIO PARA CRECER</p><h2>Lo que sigue<br />empieza<br /><em>contigo.</em></h2><BrandMark /><p>Una nueva habilidad.<br />Una nueva posibilidad.<br />Tu próximo nivel.</p><span>CERTIFIKA2 / APRENDE. CONECTA. AVANZA.</span></div>
      <div className="auth-card">
        <div className="auth-card-head">
          <p className="eyebrow">HOLA, QUÉ BUENO VERTE</p>
          <h1 className="auth-title">Entra a tu<br />próximo nivel.</h1>
        </div>
        <p className="auth-subtitle">
          Continúa con Google y encuentra tus cursos, materiales y comunidad en un solo lugar.
        </p>

        {message ? (
          <p className="auth-alert" role="alert">
            {message}
          </p>
        ) : null}

        <CognitoSignInButton disabled={loading || !configured} />
        {process.env.NODE_ENV === "development" && <div className="profile-demo-notice" style={{ alignItems: "start", flexDirection: "column", gap: 12 }}><div><strong>Explora las demos locales</strong><p>Estudiante, aula, docente y administración con datos de ejemplo. Sin Google.</p></div><Link href="/demo" className="btn btn--secondary btn--sm">Probar demos sin iniciar sesión →</Link></div>}
        {!loading && !configured ? <p className="auth-note" role="status">El acceso con Google no está disponible en este entorno. Puedes explorar el catálogo sin iniciar sesión.</p> : null}

        <div className="auth-divider">Tu aprendizaje, en un solo lugar</div>

        <p className="auth-note">
          Usa tu cuenta de Google, sin crear otra contraseña. Certifika2 no
          recibe ni almacena tu contraseña de Google.
        </p>
        <p className="auth-note">
          ¿Quieres explorar primero? <Link href="/cursos">Ver cursos →</Link>
        </p>
      </div>
    </div>
  );
}
