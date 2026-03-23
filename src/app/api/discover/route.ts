import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DISCOVERY_BATCH_SIZE } from "@/lib/constants";

function getUserId(req: NextRequest) {
  return req.headers.get("x-user-id");
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  // Get user's looking_for preference
  const { data: profile } = await supabase
    .from("profiles")
    .select("looking_for")
    .eq("id", userId)
    .single();

  if (!profile) return NextResponse.json([], { status: 200 });

  // Get discovery profiles via RPC
  const { data, error } = await supabase.rpc("get_discovery_profiles", {
    _user_id: userId,
    _looking_for: profile.looking_for || "everyone",
    _limit: DISCOVERY_BATCH_SIZE,
  });

  if (error) {
    console.error("Discovery error:", error);
    return NextResponse.json([], { status: 200 });
  }

  // Attach photos to each profile
  const profileIds = (data || []).map((p: { id: string }) => p.id);
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .in("profile_id", profileIds)
    .order("position");

  const profilesWithPhotos = (data || []).map((p: { id: string }) => ({
    ...p,
    photos: (photos || []).filter((ph: { profile_id: string }) => ph.profile_id === p.id),
  }));

  return NextResponse.json(profilesWithPhotos);
}
