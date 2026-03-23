"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTelegram } from "@/components/providers/TelegramProvider";
import ProfileForm from "@/components/profile/ProfileForm";
import { Gender, LookingFor } from "@/types/app";

export default function OnboardingPage() {
  const { user } = useTelegram();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
        body: JSON.stringify({ ...data, is_onboarded: true }),
      });

      if (res.ok) {
        router.replace("/discover");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="p-4 pt-6">
        <h1 className="text-2xl font-bold mb-1">Заполни профиль</h1>
        <p className="text-tg-hint text-sm mb-4">
          Расскажи о себе, чтобы начать знакомиться
        </p>
      </div>
      <ProfileForm
        initialData={{
          name: user?.name || "",
          bio: "",
          birth_date: "",
          gender: "male",
          looking_for: "everyone",
          photos: [],
        }}
        onSubmit={handleSubmit}
        submitLabel="Начать"
        isLoading={isLoading}
      />
    </div>
  );
}
