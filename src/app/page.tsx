"use client";

import { useState } from "react";

/* ───────────────────────── ICONS (inline SVG) ───────────────────────── */

function IconArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function IconCheck({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconWorkflow({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function IconCatalog({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  );
}

function IconIntegration({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function IconChart({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function IconMenu({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function IconX({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconSearch({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function IconMap({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function IconWrench({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 5.384a2.625 2.625 0 01-3.712-3.712l5.384-5.384m0 0L2.343 6.092a1.5 1.5 0 012.06-.396l4.5 3.038a1.5 1.5 0 00.55.168l2.316.349a1.5 1.5 0 001.653-1.653l-.35-2.316a1.5 1.5 0 00-.167-.55L9.867 2.343a1.5 1.5 0 01.396-2.06l.552-.325a3 3 0 013.525.478l6.022 6.022a3 3 0 01.478 3.525l-.325.552a1.5 1.5 0 01-2.06.396l-3.038-4.5a1.5 1.5 0 00-.55-.168l-2.316-.35a1.5 1.5 0 00-1.653 1.654l.35 2.316c.037.246.09.488.167.55l4.5 3.038" />
    </svg>
  );
}

function IconUsers({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function IconShoppingBag({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function IconStorefront({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  );
}

function IconClipboard({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function IconShield({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconChat({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}

function IconClock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconTrendingUp({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function IconBolt({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function IconHeart({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function IconWarning({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

/* ───────────────────────── HERO ILLUSTRATION ───────────────────────── */

function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Desk */}
      <rect x="80" y="280" width="340" height="12" rx="6" fill="#E5EAD4" />
      <rect x="160" y="292" width="16" height="60" rx="4" fill="#d4d9c4" />
      <rect x="324" y="292" width="16" height="60" rx="4" fill="#d4d9c4" />

      {/* Laptop base */}
      <rect x="140" y="230" width="220" height="50" rx="8" fill="#1a2332" />
      <rect x="130" y="270" width="240" height="12" rx="6" fill="#2a3342" />

      {/* Laptop screen */}
      <rect x="145" y="100" width="210" height="135" rx="8" fill="#1a2332" />
      <rect x="152" y="107" width="196" height="121" rx="4" fill="#ffffff" />

      {/* Screen content - dashboard */}
      <rect x="162" y="117" width="80" height="10" rx="3" fill="#398860" />
      <rect x="162" y="135" width="176" height="1" fill="#e5e7eb" />

      {/* Chart bars */}
      <rect x="170" y="175" width="18" height="40" rx="3" fill="#9ACC77" />
      <rect x="195" y="160" width="18" height="55" rx="3" fill="#398860" />
      <rect x="220" y="150" width="18" height="65" rx="3" fill="#9ACC77" />
      <rect x="245" y="140" width="18" height="75" rx="3" fill="#398860" />
      <rect x="270" y="155" width="18" height="60" rx="3" fill="#9ACC77" />
      <rect x="295" y="145" width="18" height="70" rx="3" fill="#398860" />
      <rect x="320" y="130" width="18" height="85" rx="3" fill="#9ACC77" />

      {/* Person - body */}
      <circle cx="250" cy="55" r="28" fill="#f5c6a0" />
      {/* Hair */}
      <ellipse cx="250" cy="40" rx="30" ry="22" fill="#5a3825" />
      <ellipse cx="235" cy="55" rx="5" ry="12" fill="#5a3825" />
      {/* Eyes */}
      <circle cx="241" cy="58" r="2.5" fill="#1a2332" />
      <circle cx="259" cy="58" r="2.5" fill="#1a2332" />
      {/* Smile */}
      <path d="M244 67 Q250 73 256 67" stroke="#1a2332" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Glasses */}
      <circle cx="241" cy="57" r="7" stroke="#1a2332" strokeWidth="1.2" fill="none" />
      <circle cx="259" cy="57" r="7" stroke="#1a2332" strokeWidth="1.2" fill="none" />
      <line x1="248" y1="57" x2="252" y2="57" stroke="#1a2332" strokeWidth="1.2" />

      {/* Body / shirt */}
      <path d="M220 82 Q250 95 280 82 L285 230 H215 Z" fill="#398860" />
      {/* Collar */}
      <path d="M235 82 L250 95 L265 82" stroke="#2c6e49" strokeWidth="2" fill="none" />

      {/* Arms */}
      <path d="M220 100 Q180 140 185 230" stroke="#f5c6a0" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M280 100 Q320 140 315 230" stroke="#f5c6a0" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* Sleeve cuffs */}
      <circle cx="185" cy="228" r="8" fill="#f5c6a0" />
      <circle cx="315" cy="228" r="8" fill="#f5c6a0" />

      {/* Floating ecommerce elements */}
      {/* Shopping cart */}
      <g transform="translate(380, 80)">
        <circle cx="20" cy="20" r="24" fill="#E5EAD4" />
        <path d="M10 10 L13 10 L18 28 L30 28 L33 16 H16" stroke="#398860" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19" cy="33" r="2" fill="#398860" />
        <circle cx="29" cy="33" r="2" fill="#398860" />
      </g>

      {/* Package box */}
      <g transform="translate(60, 120)">
        <circle cx="22" cy="22" r="24" fill="#E5EAD4" />
        <rect x="8" y="10" width="28" height="24" rx="3" stroke="#398860" strokeWidth="2" fill="none" />
        <line x1="8" y1="18" x2="36" y2="18" stroke="#398860" strokeWidth="2" />
        <line x1="22" y1="10" x2="22" y2="34" stroke="#398860" strokeWidth="2" />
      </g>

      {/* Checkmark badge */}
      <g transform="translate(395, 200)">
        <circle cx="18" cy="18" r="20" fill="#9ACC77" opacity="0.3" />
        <circle cx="18" cy="18" r="14" fill="#398860" />
        <path d="M11 18 L16 23 L25 14" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Dollar sign */}
      <g transform="translate(50, 220)">
        <circle cx="16" cy="16" r="18" fill="#E5EAD4" />
        <text x="16" y="22" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#398860">$</text>
      </g>

      {/* Stars / sparkles */}
      <g fill="#9ACC77">
        <circle cx="420" cy="150" r="3" />
        <circle cx="90" cy="80" r="2.5" />
        <circle cx="410" cy="270" r="2" />
        <circle cx="70" cy="290" r="2.5" />
      </g>
    </svg>
  );
}

/* ───────────────────────── LOGO ───────────────────────── */

function Logo({ light = false }: { light?: boolean }) {
  const color = light ? "#ffffff" : "#398860";
  return (
    <a href="#" className="flex items-center gap-3 group" aria-label="bConsulted home">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="14" cy="14" r="10" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="22" cy="14" r="10" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="18" cy="21" r="10" stroke={color} strokeWidth="1.5" fill="none" />
      </svg>
      <span className={`text-xl font-bold tracking-tight ${light ? "text-white" : "text-foreground"}`}>
        bConsulted
      </span>
    </a>
  );
}

/* ───────────────────────── NAV ───────────────────────── */

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#process" },
  { label: "Pricing", href: "#pricing" },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />

          <nav className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-primary transition"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition"
            >
              Get Started
            </a>
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle navigation"
          >
            {open ? <IconX /> : <IconMenu />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden pb-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="block px-4 py-2 bg-primary text-white rounded-lg"
              onClick={() => setOpen(false)}
            >
              Get Started
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}

/* ───────────────────────── HERO ───────────────────────── */

function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
            Transform your Shopify operations
            <span className="text-primary">.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mb-8 leading-relaxed">
            Stop managing chaos. We streamline your Shopify store operations,
            eliminate bottlenecks, and unlock growth through proven systems and
            automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-accent transition-colors"
            >
              Start Your Audit <IconArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 border-2 border-border text-foreground px-8 py-3.5 rounded-lg text-base font-semibold hover:border-primary hover:text-primary transition-colors"
            >
              Watch Demo
            </a>
          </div>
        </div>
        <div className="hidden md:block">
          <HeroIllustration className="w-full max-w-lg mx-auto" />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── TRUST STATS BAR ───────────────────────── */

const STATS = [
  { value: "500+", label: "Stores Optimized" },
  { value: "$45M+", label: "Revenue Generated" },
  { value: "97%", label: "Client Satisfaction" },
];

function TrustStats() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-primary/5 rounded-xl p-8 text-center">
            <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</p>
            <p className="text-base text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── PROBLEM STATEMENT ───────────────────────── */

function ProblemStatement() {
  return (
    <section className="py-16 md:py-20 px-6 bg-section-alt">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconWarning className="w-7 h-7 text-amber-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          Growth gets blocked by messy operations — not bad storefronts.
        </h2>
        <p className="text-base md:text-lg text-muted max-w-3xl mx-auto leading-relaxed">
          Most Shopify merchants spend too much time fixing preventable admin
          problems. Orders need manual checking. Reports don&apos;t match. Your
          accounting software tells a different story than Shopify. The team
          relies on Slack, spreadsheets, and memory to keep things running.
          That&apos;s where we come in.
        </p>
        <div className="flex justify-center mt-8">
          <div className="h-1 w-16 bg-primary/30 rounded-full" />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── SERVICES ───────────────────────── */

const SERVICES = [
  {
    icon: IconWorkflow,
    title: "Order Workflow Automation",
    description:
      "Eliminate manual order checking, inconsistent exception handling, and unclear fulfillment handoffs. We design workflows that process orders reliably without constant human intervention.",
  },
  {
    icon: IconCatalog,
    title: "Catalog & Inventory Cleanup",
    description:
      "Fix inconsistent tagging, messy collections, unreliable product types, and inaccurate inventory signals. Clean catalog structure means better reporting and fewer downstream errors.",
  },
  {
    icon: IconIntegration,
    title: "System Integration",
    description:
      "Connect Shopify to QuickBooks, ERPs, invoicing systems, and document workflows. We map data flows, build integration logic, and ensure your systems actually talk to each other.",
  },
  {
    icon: IconChart,
    title: "Reporting & Visibility",
    description:
      "Build operational dashboards your team can trust. No more metrics that differ between reports, leadership flying blind, or finding issues too late.",
  },
];

function Services() {
  return (
    <section id="services" className="py-20 md:py-28 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            What We Do
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            From order chaos to operational clarity
          </h2>
          <p className="text-base text-muted leading-relaxed">
            We focus on the four problem areas that cost growing Shopify
            merchants the most time, money, and headaches.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="bg-card-bg border border-border rounded-xl p-8 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary-pale rounded-lg flex items-center justify-center mb-5">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── PROCESS ───────────────────────── */

const STEPS = [
  {
    number: "01",
    title: "Diagnose",
    icon: IconSearch,
    description:
      "We review your current tools, admin setup, and workflows. We identify business pain, inspect real examples, and define what success looks like.",
  },
  {
    number: "02",
    title: "Map",
    icon: IconMap,
    description:
      "We map your current workflows, identify bottlenecks and data problems, define the target process, and separate quick wins from deeper work.",
  },
  {
    number: "03",
    title: "Build",
    icon: IconWrench,
    description:
      "We configure, automate, integrate, document, and test. Everything is built to run without us — you own the result, not a dependency.",
  },
  {
    number: "04",
    title: "Handoff",
    icon: IconUsers,
    description:
      "We train your team, deliver SOPs, explain what changed and what to monitor. Then we review performance and propose next steps.",
  },
];

function Process() {
  return (
    <section id="process" className="py-20 md:py-28 px-6 bg-section-alt">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            A repeatable process, not a guessing game
          </h2>
          <p className="text-base text-muted leading-relaxed">
            Every engagement follows the same proven method — diagnose the
            problem, map the solution, build it, and hand it off cleanly.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="relative">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-4xl font-bold text-primary/15 block mb-2">
                {step.number}
              </span>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── SIGNS / SOCIAL PROOF ───────────────────────── */

const SIGNS = [
  "Your team checks every order manually before fulfillment",
  "Reports from Shopify don\u2019t match your accounting numbers",
  "Catalog tags and collections are inconsistent or outdated",
  "You rely on spreadsheets to track things Shopify should handle",
  "Customer service has no clear internal process for exceptions",
  "Inventory signals are inaccurate and causing stockout or overstock",
  "Nobody can explain how data flows between your systems",
  "Leadership makes decisions based on numbers they don\u2019t trust",
];

function Signs() {
  return (
    <section id="signs" className="py-20 md:py-28 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="max-w-2xl mb-10">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            Is This You?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Signs your Shopify operations need a redesign
          </h2>
          <p className="text-base text-muted leading-relaxed">
            If three or more of these sound familiar, you&apos;re leaving money on
            the table — and probably burning out your team in the process.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {SIGNS.map((sign) => (
            <div
              key={sign}
              className="flex items-start gap-4 bg-card-bg border border-border rounded-lg p-5"
            >
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconCheck className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">{sign}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── WHO WE SERVE ───────────────────────── */

function WhoWeServe() {
  return (
    <section className="py-20 md:py-28 px-6 bg-section-alt">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
              Who We Work With
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Built for merchants who&apos;ve outgrown duct tape
            </h2>
            <p className="text-base text-muted leading-relaxed mb-6">
              We work best with Shopify merchants who are already making
              consistent sales but whose back-office processes haven&apos;t kept up
              with growth. Not brand new. Not giant enterprise. The messy
              middle — where the pain is real and the opportunity is biggest.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                icon: IconShoppingBag,
                title: "Multi-SKU retail brands",
                desc: "Complex catalogs, high order volumes, lots of product data to keep clean.",
              },
              {
                icon: IconStorefront,
                title: "Wholesale & B2B-B2C hybrid merchants",
                desc: "Multiple sales channels, different pricing logic, inventory shared across storefronts.",
              },
              {
                icon: IconClipboard,
                title: "Admin-heavy product businesses",
                desc: "Custom orders, complex fulfillment rules, lots of manual steps that should be automated.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card-bg rounded-xl p-6 border border-border flex gap-5 items-start"
              >
                <div className="w-11 h-11 bg-primary-pale rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── PRICING ───────────────────────── */

const PACKAGES = [
  {
    name: "Ops Audit",
    tagline: "For merchants who need clarity first",
    price: "2,000",
    features: [
      "90-minute discovery session",
      "Workflow & admin assessment",
      "Catalog structure review",
      "Top risks & bottlenecks identified",
      "Prioritized improvement roadmap",
    ],
    cta: "Book an Audit",
    featured: false,
  },
  {
    name: "Workflow Sprint",
    tagline: "For merchants who need one problem fixed fast",
    price: "6,000",
    features: [
      "Focused workflow design & build",
      "Implementation of one solution",
      "Testing & team handoff",
      "SOP documentation",
      "2 weeks post-launch support",
    ],
    cta: "Start a Sprint",
    featured: true,
  },
  {
    name: "Ops Backbone",
    tagline: "For merchants whose back office needs structure",
    price: "12,000",
    features: [
      "Full process mapping",
      "Automation setup",
      "Reporting structure build",
      "Integration planning & execution",
      "Rollout support & documentation",
    ],
    cta: "Build Your Backbone",
    featured: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Clear scope. Fixed price. No surprises.
          </h2>
          <p className="text-base text-muted leading-relaxed">
            We price by outcome, not by hour. You know what you&apos;re getting and
            what it costs before we start.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className={`rounded-xl p-8 flex flex-col ${
                pkg.featured
                  ? "bg-primary text-white ring-2 ring-primary shadow-xl"
                  : "bg-card-bg border border-border"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-1 ${
                  pkg.featured ? "text-white" : "text-foreground"
                }`}
              >
                {pkg.name}
              </h3>
              <p
                className={`text-sm mb-6 ${
                  pkg.featured ? "text-white/80" : "text-muted"
                }`}
              >
                {pkg.tagline}
              </p>
              <div className="mb-6">
                <span
                  className={`text-sm ${
                    pkg.featured ? "text-white/70" : "text-muted"
                  }`}
                >
                  Starting at
                </span>
                <div
                  className={`text-4xl font-bold ${
                    pkg.featured ? "text-white" : "text-foreground"
                  }`}
                >
                  ${pkg.price}
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <IconCheck
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        pkg.featured ? "text-primary-light" : "text-primary"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        pkg.featured ? "text-white/90" : "text-muted"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  pkg.featured
                    ? "bg-white text-primary hover:bg-primary-pale"
                    : "bg-primary text-white hover:bg-accent"
                }`}
              >
                {pkg.cta} <IconArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted mt-10">
          Need ongoing support? We offer monthly retainers starting at
          $1,250/mo for continuous optimization, dashboard refinement, and
          workflow tuning.
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────── CONTACT / FORM ───────────────────────── */

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="py-20 md:py-28 px-6 bg-primary">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          <div className="text-white">
            <p className="text-primary-light font-semibold text-sm tracking-wide uppercase mb-3">
              Let&apos;s Talk
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to clean up your operations?
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-8">
              Tell us what&apos;s going on. We&apos;ll schedule a 30-minute discovery
              call to understand your situation and figure out if we&apos;re the
              right fit.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconShield className="w-4 h-4 text-primary-light" />
                </div>
                <span className="text-white/90 text-sm">No-pressure conversation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconChat className="w-4 h-4 text-primary-light" />
                </div>
                <span className="text-white/90 text-sm">We&apos;ll tell you honestly if we can help</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconClock className="w-4 h-4 text-primary-light" />
                </div>
                <span className="text-white/90 text-sm">Typical response within 24 hours</span>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-white/20">
              <p className="text-white/70 text-sm mb-3">
                Prefer to book a time directly?
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Schedule on Calendly <IconArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-xl">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Message sent!
                </h3>
                <p className="text-muted">
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="store" className="block text-sm font-semibold text-foreground mb-1.5">
                    Shopify Store URL <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    id="store"
                    name="store"
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="yourstore.myshopify.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-1.5">
                    What&apos;s going on?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Tell us about your biggest operational pain point..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-lg text-sm font-semibold hover:bg-accent transition-colors"
                >
                  Send Message <IconArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── FOOTER ───────────────────────── */

function Footer() {
  return (
    <footer className="py-12 px-6 bg-foreground">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo light />
        <p className="text-white/50 text-sm">
          &copy; {new Date().getFullYear()} bConsulted. All rights reserved.
        </p>
        <div className="flex gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white/50 text-sm hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustStats />
        <ProblemStatement />
        <Services />
        <Process />
        <Signs />
        <WhoWeServe />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
