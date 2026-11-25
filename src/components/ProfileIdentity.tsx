"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth";

type ApplicationProfile = {
  idUsuario: number;
  nombreUsuario: string;
  email: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

/** Identidad del usuario tomada de los claims del JWT de sesión. */
export default function ProfileIdentity() {
  const { user, loading } = useSession();
  const [profile, setProfile] = useState<ApplicationProfile | null>(null);
  const [syncFailed, setSyncFailed] = useState(false);

  useEffect(() => {
    if (!user) return;
    setSyncFailed(false);
    setProfile(null);

    let active = true;
    fetch("/api/bff/usuarios/registro", {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return (await response.json()) as ApplicationProfile;
      })
      .then((nextProfile) => {
        if (active) setProfile(nextProfile);
      })
      .catch(() => {
        if (active) setSyncFailed(true);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <>
        <div className="avatar">…</div>
        <h2 className="profile-name">Cargando perfil…</h2>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div className="avatar">?</div>
        <h2 className="profile-name">Sesión no disponible</h2>
        <p className="profile-email">
          <Link href="/login">Volver a iniciar sesión</Link>
        </p>
      </>
    );
  }

  return (
    <>
      {user.picture ? (
        <Image
          className="avatar-image"
          src={user.picture}
          alt={profile?.nombreUsuario || user.name}
          width={64}
          height={64}
        />
      ) : (
        <div className="avatar">{initials(profile?.nombreUsuario || user.name)}</div>
      )}
      <h2 className="profile-name">{profile?.nombreUsuario || user.name}</h2>
      <p className="profile-email">
        {profile?.email || user.email}
        {user.emailVerified ? <span className="verified-badge">verificado</span> : null}
      </p>
      {user.groups.length ? (
        <div className="profile-groups" aria-label="Roles del usuario">
          {user.groups.filter(group => ["ADMIN", "PROFESOR", "ESTUDIANTE"].includes(group)).map((group) => (
            <span className="profile-group" key={group}>
              {{ ADMIN: "Administrador", PROFESOR: "Profesor", ESTUDIANTE: "Estudiante" }[group] || group}
            </span>
          ))}
        </div>
      ) : null}
      {profile ? (
        <p className="profile-email">✓ Tu perfil está sincronizado</p>
      ) : syncFailed ? (
        <p className="profile-email">No pudimos sincronizar tus datos. Intenta nuevamente.</p>
      ) : (
        <p className="profile-email">Sincronizando tus datos…</p>
      )}
    </>
  );
}
