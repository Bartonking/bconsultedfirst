"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import {
  IconCalendar,
  IconChart,
  IconClipboard,
  IconCogs,
} from "@/components/icons";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: IconChart },
  { label: "Consultations", href: "/admin/consultations", icon: IconCalendar },
  { label: "Services", href: "/admin/services", icon: IconClipboard },
  { label: "Events", href: "/admin/events", icon: IconChart },
  { label: "Calendly Logs", href: "/admin/calendly-webhooks", icon: IconCalendar },
  { label: "Intake Config", href: "/admin/services/config", icon: IconCogs },
  { label: "Archive", href: "/admin/archive", icon: IconClipboard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-foreground text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Logo light />
          <p className="text-white/40 text-xs mt-2">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="text-white/40 text-xs hover:text-white transition-colors">
            Back to website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="md:hidden bg-foreground text-white p-4 flex items-center justify-between">
          <Logo light />
          <div className="flex gap-4">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs ${pathname === item.href ? "text-white" : "text-white/60"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
