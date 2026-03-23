"use client";

import { useEffect, useState, useCallback } from "react";
import { Profile } from "@/types/app";
import { calculateAge } from "@/lib/utils";

interface UsersResponse {
  users: Profile[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    const json = await res.json();
    setData(json);
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAction = async (userId: string, action: string) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    loadUsers();
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Поиск по имени..."
        className="w-full px-4 py-2.5 rounded-xl bg-tg-secondary text-tg-text outline-none mb-4 placeholder:text-tg-hint"
      />

      {!data ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-2 border-tg-hint border-t-tg-button rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <p className="text-sm text-tg-hint mb-3">
            Всего: {data.total}
          </p>

          <div className="space-y-2">
            {data.users.map((user) => {
              const photo = user.photos?.find((p) => p.position === 0);
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-tg-secondary"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-tg-bg shrink-0">
                    {photo ? (
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-tg-hint font-bold">
                        {user.name?.[0] || "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{user.name}</h3>
                      {user.is_banned && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                          бан
                        </span>
                      )}
                      {user.is_admin && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">
                          админ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-tg-hint">
                      @{user.telegram_username || "—"} · {user.birth_date ? calculateAge(user.birth_date) : "?"} лет · ID: {user.telegram_id}
                    </p>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    {user.is_banned ? (
                      <button
                        onClick={() => handleAction(user.id, "unban")}
                        className="px-2 py-1 text-xs rounded bg-green-100 text-green-700"
                      >
                        Разбан
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(user.id, "ban")}
                        className="px-2 py-1 text-xs rounded bg-red-100 text-red-700"
                      >
                        Бан
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-tg-secondary text-sm disabled:opacity-40"
              >
                ←
              </button>
              <span className="text-sm text-tg-hint">
                {page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="px-3 py-1.5 rounded-lg bg-tg-secondary text-sm disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
