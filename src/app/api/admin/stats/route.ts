import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const isAdmin = req.headers.get("x-is-admin");
  if (isAdmin !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_admin_stats");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
