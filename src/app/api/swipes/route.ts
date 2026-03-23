import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getUserId(req: NextRequest) {
  return req.headers.get("x-user-id");
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { swiped_id, direction } = await req.json();
  if (!swiped_id || !direction) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Insert swipe (trigger handles match creation)
  const { error } = await supabase.from("swipes").insert({
    swiper_id: userId,
    swiped_id,
    direction,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already swiped" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check if a match was created
  let matched = false;
  let matchId: string | null = null;

  if (direction === "like" || direction === "superlike") {
    const [id1, id2] =
      userId < swiped_id ? [userId, swiped_id] : [swiped_id, userId];

    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .eq("user1_id", id1)
      .eq("user2_id", id2)
      .single();

    if (match) {
      matched = true;
      matchId = match.id;
    }
  }

  return NextResponse.json({ matched, matchId });
}
