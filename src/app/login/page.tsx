import type { Metadata } from "next";
import { Suspense } from "react";
import LoginContent from "@/components/LoginContent";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-wrap">Cargando…</div>}>
      <LoginContent />
    </Suspense>
  );
}
