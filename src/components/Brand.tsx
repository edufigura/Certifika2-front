export function BrandMark({ className = "" }: { className?: string }) {
  return <svg className={`brand-mark ${className}`} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M6 12.5c7-1 12 1 18 5v24c-6-4-11-6-18-5V12.5Z" fill="currentColor" opacity=".14" />
    <path d="M24 17.5c6-4 11-6 18-5v24c-7-1-12 1-18 5v-24Z" fill="currentColor" opacity=".28" />
    <path d="M6 12.5c7-1 12 1 18 5v24c-6-4-11-6-18-5V12.5Zm18 29c6-4 11-6 18-5V24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m29 18 12-12m-10 0h10v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m12 22 6 2.5m-6 4 6 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".55" />
  </svg>;
}
export default function Brand() {
  return <span className="brand-lockup"><BrandMark /><span className="brand-wordmark">Certifika<span>2</span></span></span>;
}
