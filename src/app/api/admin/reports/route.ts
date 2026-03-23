import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const isAdmin = req.headers.get("x-is-admin");
  if (isAdmin !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with user profiles
  const allIds = Array.from(new Set(
    (data || []).flatMap((r) => [r.reporter_id, r.reported_id])
  ));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, telegram_username, photos(*)")
    .in("id", allIds);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, p])
  );

  const enriched = (data || []).map((r) => ({
    ...r,
    reporter: profileMap.get(r.reporter_id),
    reported: profileMap.get(r.reported_id),
  }));

  return NextResponse.json(enriched);
}

export async function PATCH(req: NextRequest) {
  const isAdmin = req.headers.get("x-is-admin");
  const adminId = req.headers.get("x-user-id");
  if (isAdmin !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reportId, action } = await req.json();
  if (!reportId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {
    resolved_by: adminId,
    resolved_at: new Date().toISOString(),
  };

  switch (action) {
    case "resolve":
      updates.status = "resolved";
      break;
    case "dismiss":
      updates.status = "dismissed";
      break;
    case "ban_user": {
      updates.status = "resolved";
      // Also ban the reported user
      const { data: report } = await supabase
        .from("reports")
        .select("reported_id")
        .eq("id", reportId)
        .single();
      if (report) {
        await supabase
          .from("profiles")
          .update({ is_banned: true, is_active: false })
          .eq("id", report.reported_id);
      }
      break;
    }
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reports")
    .update(updates)
    .eq("id", reportId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
