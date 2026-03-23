"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/types/app";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function MessageList({
  messages,
  currentUserId,
  onLoadMore,
  hasMore,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLengthRef.current = messages.length;
  }, [messages.length]);

  // Scroll to bottom on mount
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || !hasMore) return;
    if (el.scrollTop < 50) {
      onLoadMore();
    }
  };

  // Messages come newest-first from API, reverse for display
  const sorted = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2"
    >
      {hasMore && (
        <div className="text-center py-2">
          <div className="w-5 h-5 border-2 border-tg-hint border-t-tg-button rounded-full animate-spin mx-auto" />
        </div>
      )}
      {sorted.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isMine={msg.sender_id === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
