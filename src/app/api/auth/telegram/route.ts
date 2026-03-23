import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { validateInitData } from "@/lib/telegram/validate";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();
    if (!initData) {
      return NextResponse.json({ error: "No initData" }, { status: 400 });
    }

    const telegramUser = validateInitData(initData);
    if (!telegramUser) {
      return NextResponse.json({ error: "Invalid initData" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const fullName = `${telegramUser.first_name}${telegramUser.last_name ? " " + telegramUser.last_name : ""}`;

    // Check if profile already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select()
      .eq("telegram_id", telegramUser.id)
      .single();

    if (existing) {
      // Update last_active
      await supabase
        .from("profiles")
        .update({
          last_active_at: new Date().toISOString(),
          telegram_username: telegramUser.username || null,
        })
        .eq("id", existing.id);

      return await issueToken(existing);
    }

    // Create new profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .insert({
        telegram_id: telegramUser.id,
        telegram_username: telegramUser.username || null,
        name: fullName,
        last_active_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return await issueToken(profile);
  } catch (e) {
    console.error("Auth error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function issueToken(profile: Record<string, unknown>) {
  const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);

  const token = await new SignJWT({
    sub: profile.id as string,
    telegram_id: profile.telegram_id,
    is_admin: profile.is_admin,
    role: "authenticated",
    aud: "authenticated",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const response = NextResponse.json({
    user: profile,
    token,
  });

  response.cookies.set("sb-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
