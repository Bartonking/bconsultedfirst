import { COLLECTIONS, getDb } from "@/lib/firebase";
import type { BookingSiteConfig } from "@/lib/types";
import { DEFAULT_BOOKING_CONFIG } from "@/lib/public-site-config";

const BOOKING_CONFIG_ID = "booking";

function normalizeBookingConfig(
  data: Partial<BookingSiteConfig> | null | undefined
): BookingSiteConfig {
  return {
    ...DEFAULT_BOOKING_CONFIG,
    ...data,
    consultationCurrency: "USD",
    consultationPriceCents:
      typeof data?.consultationPriceCents === "number"
        ? data.consultationPriceCents
        : DEFAULT_BOOKING_CONFIG.consultationPriceCents,
    consultationDurationMinutes:
      typeof data?.consultationDurationMinutes === "number"
        ? data.consultationDurationMinutes
        : DEFAULT_BOOKING_CONFIG.consultationDurationMinutes,
  };
}

export async function getBookingSiteConfig(): Promise<BookingSiteConfig> {
  const db = getDb();
  const doc = await db
    .collection(COLLECTIONS.siteConfig)
    .doc(BOOKING_CONFIG_ID)
    .get();

  if (!doc.exists) {
    return DEFAULT_BOOKING_CONFIG;
  }

  return normalizeBookingConfig(doc.data() as Partial<BookingSiteConfig>);
}

export async function saveBookingSiteConfig(
  input: Omit<BookingSiteConfig, "updatedAt">
): Promise<BookingSiteConfig> {
  const db = getDb();
  const now = new Date().toISOString();
  const config: BookingSiteConfig = normalizeBookingConfig({
    ...input,
    updatedAt: now,
  });

  await db.collection(COLLECTIONS.siteConfig).doc(BOOKING_CONFIG_ID).set(config);

  return config;
}
