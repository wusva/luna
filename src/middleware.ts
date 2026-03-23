import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/api/auth/telegram"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("sb-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    // Admin routes protection
    if (pathname.startsWith("/admin") && !payload.is_admin) {
      return NextResponse.redirect(new URL("/discover", req.url));
    }

    // Redirect non-onboarded users to onboarding
    // (checked on client side via profile data)

    const headers = new Headers(req.headers);
    headers.set("x-user-id", payload.sub as string);
    headers.set("x-telegram-id", String(payload.telegram_id));
    headers.set("x-is-admin", String(payload.is_admin));

    return NextResponse.next({ request: { headers } });
  } catch {
    // Invalid token - clear and redirect
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete("sb-token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
