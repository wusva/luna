import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getUserId(req: NextRequest) {
  return req.headers.get("x-user-id");
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reported_id, reason, description } = await req.json();
  if (!reported_id || !reason) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: userId,
      reported_id,
      reason,
      description: description || "",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
