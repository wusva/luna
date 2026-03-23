"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTelegram } from "@/components/providers/TelegramProvider";

export default function HomePage() {
  const { user, isLoading, isReady } = useTelegram();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isReady && user) {
      if (!user.is_onboarded) {
        router.replace("/onboarding");
      } else {
        router.replace("/discover");
      }
    }
  }, [isLoading, isReady, user, router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tg-button animate-pulse" />
        <h1 className="text-2xl font-bold mb-2">Знакомства</h1>
        <p className="text-tg-hint text-sm">
          {isLoading ? "Загрузка..." : "Откройте через Telegram"}
        </p>
      </div>
    </div>
  );
}
