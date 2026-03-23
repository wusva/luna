"use client";

import { useEffect, useState } from "react";
import { AdminStats } from "@/types/app";

const STAT_LABELS: Record<string, string> = {
  total_users: "Всего пользователей",
  active_users: "Активных",
  total_matches: "Мэтчей",
  total_messages: "Сообщений",
  pending_reports: "Жалоб (ожидание)",
  users_today: "Новых сегодня",
  matches_today: "Мэтчей сегодня",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-tg-hint border-t-tg-button rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className={cn(
              "p-4 rounded-xl bg-tg-secondary",
              key === "pending_reports" && (value as number) > 0 && "border-2 border-tg-destructive"
            )}
          >
            <p className="text-2xl font-bold">{value as number}</p>
            <p className="text-xs text-tg-hint mt-1">
              {STAT_LABELS[key] || key}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
