import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MESSAGES_PAGE_SIZE } from "@/lib/constants";

function getUserId(req: NextRequest) {
  return req.headers.get("x-user-id");
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  const cursor = searchParams.get("cursor");

  if (!matchId) return NextResponse.json({ error: "Missing matchId" }, { status: 400 });

  const supabase = createAdminClient();

  // Verify user belongs to this match
  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .eq("id", matchId)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .single();

  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let query = supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(MESSAGES_PAGE_SIZE);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: messages, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("match_id", matchId)
    .neq("sender_id", userId)
    .eq("is_read", false);

  return NextResponse.json(messages || []);
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId, content } = await req.json();
  if (!matchId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify user belongs to this match
  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .eq("id", matchId)
    .eq("is_active", true)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .single();

  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      match_id: matchId,
      sender_id: userId,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(message);
}
