"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  {
    href: "/discover",
    label: "Поиск",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/matches",
    label: "Мэтчи",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Профиль",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on chat pages
  if (pathname.startsWith("/chat/")) return null;

  return (
    <nav className="flex items-center justify-around border-t border-tg-secondary bg-tg-bg safe-bottom py-2">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 py-1 transition-colors",
              active ? "text-tg-button" : "text-tg-hint"
            )}
          >
            {tab.icon(active)}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
