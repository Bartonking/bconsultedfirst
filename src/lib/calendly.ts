export function getCalendlyBaseUrl(): string | null {
  return (
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    process.env.CALENDLY_URL ||
    null
  );
}

export function createCalendlySchedulingUrl({
  consultationId,
  name,
  email,
}: {
  consultationId: string;
  name?: string | null;
  email?: string | null;
}): string | null {
  const baseUrl = getCalendlyBaseUrl();
  if (!baseUrl) return null;

  const url = new URL(baseUrl);
  url.searchParams.set("hide_gdpr_banner", "1");

  if (name?.trim()) {
    url.searchParams.set("name", name.trim());
  }

  if (email?.trim()) {
    url.searchParams.set("email", email.trim());
  }

  url.searchParams.set("utm_content", consultationId);
  return url.toString();
}
