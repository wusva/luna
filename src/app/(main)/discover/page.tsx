"use client";

import { useEffect, useState } from "react";
import CardStack from "@/components/cards/CardStack";
import { Profile } from "@/types/app";

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  useEffect(() => {
    fetch("/api/discover")
      .then((r) => r.json())
      .then((data) => setProfiles(Array.isArray(data) ? data : []))
      .catch(() => setProfiles([]));
  }, []);

  if (profiles === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tg-hint border-t-tg-button rounded-full animate-spin" />
      </div>
    );
  }

  return <CardStack initialProfiles={profiles} />;
}
