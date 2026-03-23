"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTelegram } from "@/components/providers/TelegramProvider";
import BottomNav from "@/components/ui/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useTelegram();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !user.is_onboarded) {
      router.replace("/onboarding");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
      <BottomNav />
    </div>
  );
}
