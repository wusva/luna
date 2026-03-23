import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_PHOTOS } from "@/lib/constants";

function getUserId(req: NextRequest) {
  return req.headers.get("x-user-id");
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  // Check photo count
  const { count } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", userId);

  if ((count || 0) >= MAX_PHOTOS) {
    return NextResponse.json({ error: "Max photos reached" }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);

  const { data: photo, error } = await supabase
    .from("photos")
    .insert({
      profile_id: userId,
      storage_path: path,
      url: urlData.publicUrl,
      position: count || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(photo);
}

export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const photoId = searchParams.get("id");
  if (!photoId) return NextResponse.json({ error: "No photo id" }, { status: 400 });

  const supabase = createAdminClient();

  const { data: photo } = await supabase
    .from("photos")
    .select()
    .eq("id", photoId)
    .eq("profile_id", userId)
    .single();

  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase.storage.from("photos").remove([photo.storage_path]);
  await supabase.from("photos").delete().eq("id", photoId);

  return NextResponse.json({ success: true });
}
