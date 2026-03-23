import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const isAdmin = req.headers.get("x-is-admin");
  if (isAdmin !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = createAdminClient();

  let query = supabase
    .from("profiles")
    .select("*, photos(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,telegram_username.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    users: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / perPage),
  });
}

export async function PATCH(req: NextRequest) {
  const isAdmin = req.headers.get("x-is-admin");
  if (isAdmin !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, action } = await req.json();
  if (!userId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  switch (action) {
    case "ban":
      updates.is_banned = true;
      updates.is_active = false;
      break;
    case "unban":
      updates.is_banned = false;
      updates.is_active = true;
      break;
    case "make_admin":
      updates.is_admin = true;
      break;
    case "remove_admin":
      updates.is_admin = false;
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
