import { createHmac, timingSafeEqual } from "crypto";

export interface ServiceIntakeTokenPayload {
  engagementId: string;
  leadId: string;
  exp: number;
}

function getSecret(): string {
  const secret =
    process.env.SERVICE_INTAKE_TOKEN_SECRET || process.env.BOOKING_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      "Missing SERVICE_INTAKE_TOKEN_SECRET or BOOKING_TOKEN_SECRET"
    );
  }

  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createServiceIntakeToken(
  payload: Omit<ServiceIntakeTokenPayload, "exp">
): string {
  const full: ServiceIntakeTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  };

  const data = Buffer.from(JSON.stringify(full)).toString("base64url");
  const signature = sign(data);
  return `${data}.${signature}`;
}

export function verifyServiceIntakeToken(
  token: string
): ServiceIntakeTokenPayload | null {
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
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf-8")
    ) as ServiceIntakeTokenPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
