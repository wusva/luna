"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/types/app";
import { calculateAge } from "@/lib/utils";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then(setProfile)
      .catch(console.error);
  }, []);

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tg-hint border-t-tg-button rounded-full animate-spin" />
      </div>
    );
  }

  const mainPhoto = profile.photos?.find((p) => p.position === 0);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="relative">
        <div className="aspect-[3/4] max-h-[50vh] bg-tg-secondary">
          {mainPhoto ? (
            <img
              src={mainPhoto.url}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-tg-hint">
              Нет фото
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-16">
          <h1 className="text-2xl font-bold text-white">
            {profile.name}, {calculateAge(profile.birth_date)}
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {profile.bio && (
          <div>
            <h3 className="text-sm font-medium text-tg-hint mb-1">О себе</h3>
            <p className="text-tg-text">{profile.bio}</p>
          </div>
        )}

        {/* Photo grid */}
        {profile.photos && profile.photos.length > 1 && (
          <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
            {profile.photos.slice(1).map((photo) => (
              <div key={photo.id} className="aspect-square">
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push("/profile/edit")}
          className="w-full py-3 rounded-xl bg-tg-secondary text-tg-text font-medium"
        >
          Редактировать профиль
        </button>
      </div>
    </div>
  );
}
