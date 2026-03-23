"use client";

import { SwipeDirection } from "@/types/app";

interface ActionButtonsProps {
  onAction: (direction: SwipeDirection) => void;
  disabled?: boolean;
}

export default function ActionButtons({ onAction, disabled }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-5 py-4">
      <button
        onClick={() => onAction("dislike")}
        disabled={disabled}
        className="w-14 h-14 rounded-full border-2 border-nope flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff4458" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <button
        onClick={() => onAction("superlike")}
        disabled={disabled}
        className="w-11 h-11 rounded-full border-2 border-superlike flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#00bfff" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
        </svg>
      </button>

      <button
        onClick={() => onAction("like")}
        disabled={disabled}
        className="w-14 h-14 rounded-full border-2 border-like flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#00d46a" stroke="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
}
