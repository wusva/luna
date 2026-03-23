"use client";

import { useEffect, useState } from "react";
import { Report } from "@/types/app";

const REASON_LABELS: Record<string, string> = {
  fake_profile: "Фейковый профиль",
  inappropriate_photos: "Неприемлемые фото",
  harassment: "Домогательства",
  spam: "Спам",
  underage: "Несовершеннолетний",
  other: "Другое",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [filter, setFilter] = useState("pending");

  const loadReports = async () => {
    const res = await fetch(`/api/admin/reports?status=${filter}`);
    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadReports();
  }, [filter]);

  const handleAction = async (reportId: string, action: string) => {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, action }),
    });
    loadReports();
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        {["pending", "resolved", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? "bg-tg-button text-tg-button-text"
                : "bg-tg-secondary text-tg-hint"
            }`}
          >
            {s === "pending" ? "Ожидание" : s === "resolved" ? "Решено" : "Отклонено"}
          </button>
        ))}
      </div>

      {reports === null ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-2 border-tg-hint border-t-tg-button rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center p-8 text-tg-hint">
          Нет жалоб
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="p-4 rounded-xl bg-tg-secondary">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                    {REASON_LABELS[report.reason] || report.reason}
                  </span>
                  <p className="text-xs text-tg-hint mt-1">
                    {new Date(report.created_at).toLocaleString("ru-RU")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mb-2 text-sm">
                <div>
                  <span className="text-tg-hint">От: </span>
                  <span className="font-medium">
                    {(report.reporter as any)?.name || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-tg-hint">На: </span>
                  <span className="font-medium">
                    {(report.reported as any)?.name || "—"}
                  </span>
                </div>
              </div>

              {report.description && (
                <p className="text-sm text-tg-text mb-3">{report.description}</p>
              )}

              {filter === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(report.id, "resolve")}
                    className="px-3 py-1.5 text-xs rounded-lg bg-green-100 text-green-700 font-medium"
                  >
                    Решено
                  </button>
                  <button
                    onClick={() => handleAction(report.id, "ban_user")}
                    className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-700 font-medium"
                  >
                    Забанить
                  </button>
                  <button
                    onClick={() => handleAction(report.id, "dismiss")}
                    className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-600 font-medium"
                  >
                    Отклонить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
