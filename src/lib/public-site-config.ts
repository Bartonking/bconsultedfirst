import type { BookingSiteConfig } from "./types";

export const DEFAULT_BOOKING_CONFIG: BookingSiteConfig = {
  consultationPriceCents: 5000,
  consultationCurrency: "USD",
  consultationDurationMinutes: 30,
  consultationCtaLabel: "Book a Consultation",
  consultationDescription:
    "Review your audit findings with a specialist and create an improvement plan.",
};

export function formatPriceFromCents(
  cents: number,
  currency: BookingSiteConfig["consultationCurrency"]
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function getBookingPriceLabel(config: BookingSiteConfig): string {
  return formatPriceFromCents(
    config.consultationPriceCents,
    config.consultationCurrency
  );
}
