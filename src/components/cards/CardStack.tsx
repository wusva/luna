"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import SwipeCard from "./SwipeCard";
import ActionButtons from "./ActionButtons";
import MatchModal from "./MatchModal";
import { Profile, SwipeDirection } from "@/types/app";
import { useRouter } from "next/navigation";

interface CardStackProps {
  initialProfiles: Profile[];
}

export default function CardStack({ initialProfiles }: CardStackProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [matchedUser, setMatchedUser] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const currentProfile = profiles[0];

  const loadMore = useCallback(async () => {
    try {
      const res = await fetch("/api/discover");
      if (res.ok) {
        const data = await res.json();
        setProfiles((prev) => [...prev, ...data]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSwipe = useCallback(
    async (direction: SwipeDirection) => {
      if (!currentProfile || isLoading) return;
      setIsLoading(true);

      try {
        const res = await fetch("/api/swipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            swiped_id: currentProfile.id,
            direction,
          }),
        });

        const data = await res.json();

        // Remove swiped card
        setProfiles((prev) => prev.slice(1));

        // Check for match
        if (data.matched) {
          setMatchedUser(currentProfile);
          setShowMatch(true);
        }

        // Load more if running low
        if (profiles.length <= 3) {
          loadMore();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    },
    [currentProfile, isLoading, profiles.length, loadMore]
  );

  if (profiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <div className="text-6xl mb-4">👀</div>
          <h2 className="text-xl font-bold mb-2">Пока никого нет</h2>
          <p className="text-tg-hint text-sm">
            Загляни позже — здесь появятся новые люди
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 relative mx-4 my-2">
        <AnimatePresence>
          {profiles.slice(0, 2).map((profile, i) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
              isTop={i === 0}
            />
          ))}
        </AnimatePresence>
      </div>

      <ActionButtons onAction={handleSwipe} disabled={isLoading} />

      <MatchModal
        isOpen={showMatch}
        matchedUser={matchedUser}
        onChat={() => {
          setShowMatch(false);
          // Navigate to chat (matchId from last swipe response)
          router.push("/matches");
        }}
        onContinue={() => setShowMatch(false)}
      />
    </>
  );
}
