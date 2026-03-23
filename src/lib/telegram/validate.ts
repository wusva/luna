import crypto from "crypto";
import { TelegramUser } from "./types";

const MAX_AUTH_AGE_SECONDS = 86400; // 24 hours

export function validateInitData(initDataRaw: string): TelegramUser | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN not set");

  const params = new URLSearchParams(initDataRaw);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");

  // Check auth_date freshness
  const authDate = parseInt(params.get("auth_date") || "0", 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > MAX_AUTH_AGE_SECONDS) return null;

  // Sort params and build check string
  const checkArr: string[] = [];
  params.sort();
  params.forEach((value, key) => {
    checkArr.push(`${key}=${value}`);
  });
  const dataCheckString = checkArr.join("\n");

  // HMAC-SHA256 validation
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash !== hash) return null;

  // Parse user
  const userStr = params.get("user");
  if (!userStr) return null;

  try {
    return JSON.parse(decodeURIComponent(userStr)) as TelegramUser;
  } catch {
    return null;
  }
}
