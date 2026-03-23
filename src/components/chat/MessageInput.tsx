"use client";

import { useState, useRef } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-tg-bg border-t border-tg-secondary safe-bottom">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Сообщение..."
        rows={1}
        disabled={disabled}
        className="flex-1 px-4 py-2.5 rounded-2xl bg-tg-secondary text-tg-text outline-none resize-none max-h-32 text-[15px] placeholder:text-tg-hint"
        style={{ minHeight: "40px" }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="shrink-0 w-10 h-10 rounded-full bg-tg-button text-tg-button-text flex items-center justify-center disabled:opacity-40 transition-opacity"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
}
