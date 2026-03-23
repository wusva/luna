"use client";

import { useEffect, useState } from "react";
import { Match } from "@/types/app";
import MatchListItem from "@/components/matches/MatchListItem";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((data) => setMatches(Array.isArray(data) ? data : []))
      .catch(() => setMatches([]));
  }, []);

  if (matches === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tg-hint border-t-tg-button rounded-full animate-spin" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-bold mb-2">Пока нет мэтчей</h2>
          <p className="text-tg-hint text-sm">
            Продолжай свайпать — совпадения появятся здесь
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Мэтчи</h1>
        <div className="space-y-1">
          {matches.map((match) => (
            <MatchListItem key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}
