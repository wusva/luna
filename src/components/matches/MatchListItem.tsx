"use client";

import { Match } from "@/types/app";
import { formatTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface MatchListItemProps {
  match: Match;
}

export default function MatchListItem({ match }: MatchListItemProps) {
  const router = useRouter();
  const user = match.other_user;
  if (!user) return null;

  const photo = user.photos?.find((p) => p.position === 0);
  const lastMsg = match.last_message;

  return (
    <button
      onClick={() => router.push(`/chat/${match.id}`)}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-tg-secondary transition-colors text-left"
    >
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-tg-secondary">
          {photo ? (
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-tg-hint text-lg font-bold">
              {user.name[0]}
            </div>
          )}
        </div>
        {(match.unread_count || 0) > 0 && (
          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-tg-button text-tg-button-text text-xs flex items-center justify-center font-bold">
            {match.unread_count}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold truncate">{user.name}</h3>
          {lastMsg && (
            <span className="text-xs text-tg-hint shrink-0 ml-2">
              {formatTime(lastMsg.created_at)}
            </span>
          )}
        </div>
        <p className="text-sm text-tg-hint truncate">
          {lastMsg ? lastMsg.content : "Напишите первым!"}
        </p>
      </div>
    </button>
  );
}
