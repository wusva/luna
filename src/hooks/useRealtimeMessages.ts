"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/types/app";

export function useRealtimeMessages(
  matchId: string,
  onNewMessage: (msg: Message) => void
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          callbackRef.current(payload.new as Message);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          // Handle read status updates if needed
          callbackRef.current(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);
}
