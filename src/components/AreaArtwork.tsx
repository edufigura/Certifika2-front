const CONFIG: Record<string, { label: string; color: string; kind: number }> = {
  ciberseguridad: { label: "SECURITY", color: "#254bff", kind: 0 },
  iot: { label: "CONNECTED", color: "#087d7f", kind: 1 },
  "cloud-devops": { label: "CLOUD", color: "#6750b4", kind: 2 },
  datos: { label: "DATA", color: "#b85a22", kind: 3 },
  ia: { label: "INTELLIGENCE", color: "#254bff", kind: 4 },
  web: { label: "DEVELOPMENT", color: "#087d7f", kind: 2 },
  redes: { label: "NETWORKS", color: "#6750b4", kind: 1 },
};
export default function AreaArtwork({ areaId, compact = false }: { areaId: string; compact?: boolean }) {
  const { label, color, kind } = CONFIG[areaId] || CONFIG["cloud-devops"];
  return <div className={`area-art ${compact ? "area-art--compact" : ""}`} style={{ "--art-color": color } as React.CSSProperties} aria-hidden="true">
    {!compact && <span className="art-label">C2 / {label}</span>}
    <svg viewBox="0 0 240 160" fill="none" className="area-art-svg">
      {kind === 0 ? <g stroke="currentColor" strokeWidth="2"><path d="m120 20 60 30v38c0 28-60 53-60 53S60 116 60 88V50l60-30Z"/><path d="m120 39 42 21v26c0 20-42 39-42 39s-42-19-42-39V60l42-21Z"/><path d="m101 80 13 13 27-29" strokeWidth="5"/></g>
      : kind === 1 ? <g stroke="currentColor" strokeWidth="2"><rect x="92" y="52" width="56" height="56" rx="12"/><rect x="106" y="66" width="28" height="28" rx="4"/><path d="M120 52V22m28 58h38m-94 0H54m66 28v30m-17-86V37h-30m64 71v15h32"/>{[[120,20],[188,80],[52,80],[120,140],[71,37],[171,123]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="currentColor"/>)}</g>
      : kind === 2 ? <g stroke="currentColor" strokeWidth="2"><path d="m120 22 66 36-66 38-66-38 66-36Z"/><path d="m54 80 66 38 66-38m-132 24 66 38 66-38"/><path d="M120 96v46m0-120v24" strokeDasharray="4 5"/></g>
      : kind === 3 ? <g fill="currentColor"><rect x="57" y="98" width="22" height="40" rx="4" opacity=".35"/><rect x="92" y="76" width="22" height="62" rx="4" opacity=".55"/><rect x="127" y="53" width="22" height="85" rx="4" opacity=".75"/><rect x="162" y="24" width="22" height="114" rx="4"/><path d="m59 72 42-33 31 3 48-29" fill="none" stroke="currentColor" strokeWidth="2"/></g>
      : <g stroke="currentColor" strokeWidth="2"><ellipse cx="120" cy="80" rx="70" ry="28"/><ellipse cx="120" cy="80" rx="70" ry="28" transform="rotate(60 120 80)"/><ellipse cx="120" cy="80" rx="70" ry="28" transform="rotate(120 120 80)"/><circle cx="120" cy="80" r="10" fill="currentColor"/></g>}
    </svg>
    {!compact && <span className="art-corner">↗</span>}
  </div>;
}
