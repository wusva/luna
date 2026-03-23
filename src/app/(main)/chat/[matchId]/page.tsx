"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Message, Profile } from "@/types/app";
import { useTelegram } from "@/components/providers/TelegramProvider";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { MESSAGES_PAGE_SIZE } from "@/lib/constants";

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, webApp } = useTelegram();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial messages and match info
  useEffect(() => {
    async function load() {
      try {
        const [msgRes, matchRes] = await Promise.all([
          fetch(`/api/messages?matchId=${matchId}`),
          fetch("/api/matches"),
        ]);

        const msgs = await msgRes.json();
        setMessages(Array.isArray(msgs) ? msgs : []);
        setHasMore((msgs?.length || 0) >= MESSAGES_PAGE_SIZE);

        const matches = await matchRes.json();
        const match = Array.isArray(matches)
          ? matches.find((m: { id: string }) => m.id === matchId)
          : null;
        if (match?.other_user) {
          setOtherUser(match.other_user);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [matchId]);

  // Telegram back button
  useEffect(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      const handler = () => router.back();
      webApp.BackButton.onClick(handler);
      return () => {
        webApp.BackButton.offClick(handler);
        webApp.BackButton.hide();
      };
    }
  }, [webApp, router]);

  // Realtime messages
  useRealtimeMessages(matchId, (msg) => {
    setMessages((prev) => {
      if (prev.find((m) => m.id === msg.id)) {
        return prev.map((m) => (m.id === msg.id ? msg : m));
      }
      return [...prev, msg];
    });
  });

  const handleSend = async (content: string) => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, content }),
      });
      const msg = await res.json();
      if (msg.id) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || messages.length === 0) return;
    const oldest = [...messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0];

    const res = await fetch(
      `/api/messages?matchId=${matchId}&cursor=${oldest.created_at}`
    );
    const older = await res.json();
    if (Array.isArray(older)) {
      setMessages((prev) => [...older, ...prev]);
      setHasMore(older.length >= MESSAGES_PAGE_SIZE);
    }
  }, [hasMore, messages, matchId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tg-hint border-t-tg-button rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-tg-secondary">
        <button onClick={() => router.back()} className="text-tg-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {otherUser && (
          <>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-tg-secondary shrink-0">
              {otherUser.photos?.[0] ? (
                <img
                  src={otherUser.photos[0].url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-tg-hint font-bold">
                  {otherUser.name[0]}
                </div>
              )}
            </div>
            <h2 className="font-semibold truncate">{otherUser.name}</h2>
          </>
        )}
      </div>

      <MessageList
        messages={messages}
        currentUserId={user?.id || ""}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />

      <MessageInput onSend={handleSend} />
    </div>
  );
}
