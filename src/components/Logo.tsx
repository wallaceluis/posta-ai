export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="8" fill="#e8593c" />
        <path d="M10 22V10h6.5a4 4 0 0 1 0 8H10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="22" cy="22" r="2" fill="#fff" />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight">Posta Aí</span>
    </span>
  );
}
