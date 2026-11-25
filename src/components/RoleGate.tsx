"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSession } from "@/lib/auth";

export default function RoleGate({
  roles,
  children,
}: {
  roles: string[];
  children: ReactNode;
}) {
  const { signedIn, user, loading } = useSession();

  if (loading) {
    return <div className="container section">Validando permisos…</div>;
  }

  if (!signedIn || !user) {
    return (
      <div className="container section empty-state">
        <h2>Inicia sesión para continuar</h2>
        <p>Entra con tu cuenta de Google para acceder a tu espacio.</p>
        <Link className="btn btn--primary" href="/login">Iniciar sesión</Link>
      </div>
    );
  }

  if (!roles.some((role) => user.groups.includes(role))) {
    return (
      <div className="container section empty-state">
        <h2>Acceso restringido</h2>
        <p>Este espacio es para {roles.map(role => role === "ADMIN" ? "administradores" : "profesores").join(" o ")}. Puedes revisar tu cuenta desde tu perfil.</p>
        <Link className="btn btn--secondary" href="/perfil">Ver mi perfil</Link>
      </div>
    );
  }

  return children;
}
