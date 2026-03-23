"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/profile/ProfileForm";
import { Profile, Gender, LookingFor } from "@/types/app";

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then(setProfile)
      .catch(console.error);
  }, []);

  const handleSubmit = async (data: {
    name: string;
    bio: string;
    birth_date: string;
    gender: Gender;
    looking_for: LookingFor;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) router.back();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tg-hint border-t-tg-button rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="p-4 pt-6">
        <h1 className="text-xl font-bold">Редактирование</h1>
      </div>
      <ProfileForm
        initialData={{
          name: profile.name,
          bio: profile.bio,
          birth_date: profile.birth_date,
          gender: profile.gender,
          looking_for: profile.looking_for,
          photos: profile.photos || [],
        }}
        onSubmit={handleSubmit}
        submitLabel="Сохранить"
        isLoading={isLoading}
      />
    </div>
  );
}
