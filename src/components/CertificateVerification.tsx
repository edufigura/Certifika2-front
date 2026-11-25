"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { certificateRequest } from "@/lib/certificates";

type Verification = { valido: boolean; codigoVerificacion: string; nombreTitular: string | null; nombreCurso: string | null; nivelCurso: string | null; fechaEmision: string | null };
export default function CertificateVerification() {
  const params = useSearchParams();
  const initial = params.get("codigo") || "";
  const [code, setCode] = useState(initial);
  const [result, setResult] = useState<Verification | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const verify = useCallback(async (value: string) => {
    if (!value.trim()) return;
    setBusy(true); setError(""); setResult(null);
    try { setResult(await certificateRequest<Verification>(`certificados/verificar/${encodeURIComponent(value.trim())}`)); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo consultar el certificado."); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { if (initial) { setCode(initial); void verify(initial); } }, [initial, verify]);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void verify(code); }
  return <div className="container" style={{ maxWidth: 760 }}><section className="card card-pad">
    <form onSubmit={submit} className="dashboard-form"><label>Código de verificación<input required maxLength={100} value={code} onChange={event => setCode(event.target.value)} autoComplete="off" /></label><button className="btn btn--primary" disabled={busy}>{busy ? "Verificando…" : "Verificar certificado"}</button></form>
    {error && <p role="alert" className="auth-alert">{error}</p>}
    {result && <div role="status" style={{ marginTop: 24 }}><h2>{result.valido ? "Certificado válido" : "Certificado no encontrado"}</h2>
      {result.valido ? <><p>{result.nombreTitular}</p><p><strong>{result.nombreCurso}</strong> · {result.nivelCurso}</p><p>Emitido el {result.fechaEmision ? new Date(result.fechaEmision).toLocaleDateString("es-CL") : "—"}</p></> : <p>Comprueba el código impreso en el documento y vuelve a intentarlo.</p>}
    </div>}
  </section></div>;
}
