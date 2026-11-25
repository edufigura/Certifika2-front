import { Suspense } from "react";
import CertificateVerification from "@/components/CertificateVerification";

export const metadata = { title: "Verificar certificado" };
export default function VerifyPage() {
  return <><section className="page-head"><div className="container"><p className="eyebrow">CERTIFIKA2</p><h1 className="page-title">Verificar certificado.</h1><p className="page-subtitle">Comprueba la autenticidad de un certificado con su código de verificación.</p></div></section><section className="section" style={{ paddingTop: 0 }}><Suspense fallback={<p className="container">Cargando verificación…</p>}><CertificateVerification /></Suspense></section></>;
}
