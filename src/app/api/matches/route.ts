import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getUserId(req: NextRequest) {
  return req.headers.get("x-user-id");
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  // Get all active matches
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with other user's profile and last message
  const enriched = await Promise.all(
    (matches || []).map(async (match) => {
      const otherUserId =
        match.user1_id === userId ? match.user2_id : match.user1_id;

      const [{ data: otherUser }, { data: lastMsg }, { count }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("*, photos(*)")
            .eq("id", otherUserId)
            .single(),
          supabase
            .from("messages")
            .select("*")
            .eq("match_id", match.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("match_id", match.id)
            .eq("is_read", false)
            .neq("sender_id", userId),
        ]);

      return {
        ...match,
        other_user: otherUser,
        last_message: lastMsg,
        unread_count: count || 0,
      };
    })
  );

  return NextResponse.json(enriched);
}
