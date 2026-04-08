import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  const color = light ? "#ffffff" : "#398860";
  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label="bConsulted First home">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="14" cy="14" r="10" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="22" cy="14" r="10" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="18" cy="21" r="10" stroke={color} strokeWidth="1.5" fill="none" />
      </svg>
      <span className={`text-xl font-bold tracking-tight ${light ? "text-white" : "text-foreground"}`}>
        bConsulted<span className="text-primary">First</span>
      </span>
    </Link>
  );
}
