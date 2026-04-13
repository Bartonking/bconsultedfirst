import { createHmac, timingSafeEqual } from "crypto";

export interface BookingTokenPayload {
  leadId: string;
  reportId?: string;
  source: "audit_email" | "results_page";
  exp: number;
}

function getSecret(): string {
  const secret = process.env.BOOKING_TOKEN_SECRET;
  if (!secret) throw new Error("Missing BOOKING_TOKEN_SECRET");
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createBookingToken(
  payload: Omit<BookingTokenPayload, "exp">
): string {
  const full: BookingTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14, // 14 days
  };
  const data = Buffer.from(JSON.stringify(full)).toString("base64url");
  const signature = sign(data);
  return `${data}.${signature}`;
}

export function verifyBookingToken(
  token: string
): BookingTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [data, signature] = parts;

  const expected = sign(data);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  try {
    const payload: BookingTokenPayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf-8")
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
