"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Дашборд", icon: "📊" },
  { href: "/admin/users", label: "Пользователи", icon: "👥" },
  { href: "/admin/reports", label: "Жалобы", icon: "🚩" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-tg-secondary">
        <h1 className="font-bold text-lg">Админ-панель</h1>
        <button
          onClick={() => router.push("/discover")}
          className="text-sm text-tg-link"
        >
          К приложению
        </button>
      </div>

      <div className="flex gap-1 px-4 py-2 border-b border-tg-secondary overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              pathname === item.href
                ? "bg-tg-button text-tg-button-text"
                : "text-tg-hint"
            )}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">{children}</div>
    </div>
  );
}
