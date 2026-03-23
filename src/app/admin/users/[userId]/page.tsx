"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Profile } from "@/types/app";
import { calculateAge } from "@/lib/utils";

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    fetch(`/api/admin/users?search=`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.users?.find((u: Profile) => u.id === userId);
        setUser(found || null);
      })
      .catch(console.error);
  }, [userId]);

  const handleAction = async (action: string) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    router.back();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-tg-hint border-t-tg-button rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => router.back()} className="text-tg-link text-sm">
        ← Назад
      </button>

      <div className="text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-tg-secondary mx-auto mb-3">
          {user.photos?.[0] ? (
            <img src={user.photos[0].url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-tg-hint">
              {user.name?.[0]}
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-tg-hint text-sm">
          @{user.telegram_username || "—"} · {user.birth_date ? calculateAge(user.birth_date) : "?"} лет
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between p-3 rounded-xl bg-tg-secondary">
          <span className="text-tg-hint">Telegram ID</span>
          <span>{user.telegram_id}</span>
        </div>
        <div className="flex justify-between p-3 rounded-xl bg-tg-secondary">
          <span className="text-tg-hint">Пол</span>
          <span>{user.gender === "male" ? "М" : user.gender === "female" ? "Ж" : "Другой"}</span>
        </div>
        <div className="flex justify-between p-3 rounded-xl bg-tg-secondary">
          <span className="text-tg-hint">Ищет</span>
          <span>{user.looking_for === "male" ? "Парней" : user.looking_for === "female" ? "Девушек" : "Всех"}</span>
        </div>
        <div className="flex justify-between p-3 rounded-xl bg-tg-secondary">
          <span className="text-tg-hint">Статус</span>
          <span>{user.is_banned ? "Забанен" : user.is_active ? "Активен" : "Неактивен"}</span>
        </div>
        <div className="flex justify-between p-3 rounded-xl bg-tg-secondary">
          <span className="text-tg-hint">Регистрация</span>
          <span>{new Date(user.created_at).toLocaleDateString("ru-RU")}</span>
        </div>
      </div>

      {user.bio && (
        <div className="p-3 rounded-xl bg-tg-secondary">
          <p className="text-xs text-tg-hint mb-1">О себе</p>
          <p className="text-sm">{user.bio}</p>
        </div>
      )}

      {user.photos && user.photos.length > 0 && (
        <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
          {user.photos.map((photo) => (
            <div key={photo.id} className="aspect-square">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {user.is_banned ? (
          <button
            onClick={() => handleAction("unban")}
            className="flex-1 py-3 rounded-xl bg-green-500 text-white font-medium"
          >
            Разбанить
          </button>
        ) : (
          <button
            onClick={() => handleAction("ban")}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium"
          >
            Забанить
          </button>
        )}
        {!user.is_admin ? (
          <button
            onClick={() => handleAction("make_admin")}
            className="flex-1 py-3 rounded-xl bg-tg-button text-tg-button-text font-medium"
          >
            Сделать админом
          </button>
        ) : (
          <button
            onClick={() => handleAction("remove_admin")}
            className="flex-1 py-3 rounded-xl bg-tg-secondary text-tg-text font-medium"
          >
            Убрать админа
          </button>
        )}
      </div>
    </div>
  );
}
