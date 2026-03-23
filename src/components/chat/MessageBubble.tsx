"use client";

import { Message } from "@/types/app";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const time = new Date(message.created_at).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex mb-1", isMine && "justify-end")}>
      <div
        className={cn(
          "max-w-[75%] px-3 py-2 rounded-2xl",
          isMine
            ? "bg-tg-button text-tg-button-text rounded-br-md"
            : "bg-tg-secondary text-tg-text rounded-bl-md"
        )}
      >
        <p className="text-[15px] leading-snug break-words whitespace-pre-wrap">
          {message.content}
        </p>
        <p
          className={cn(
            "text-[11px] mt-0.5 text-right",
            isMine ? "text-white/60" : "text-tg-hint"
          )}
        >
          {time}
          {isMine && (
            <span className="ml-1">{message.is_read ? "✓✓" : "✓"}</span>
          )}
        </p>
      </div>
    </div>
  );
}
