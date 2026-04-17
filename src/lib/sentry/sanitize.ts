const REDACTED = "[REDACTED]";
const TRUNCATED = "[TRUNCATED]";
const MAX_DEPTH = 4;
const MAX_KEYS = 30;
const MAX_ARRAY_ITEMS = 20;
const MAX_STRING_LENGTH = 500;

const SENSITIVE_KEY_PATTERN =
  /(authorization|cookie|set-cookie|token|secret|signature|password|passwd|api[-_]?key|private[-_]?key|worker[-_]?secret|session[_-]?id|dsn)/i;

function truncate(value: string, maxLength = MAX_STRING_LENGTH): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)} ${TRUNCATED}`;
}

function sanitizeQueryEntries(params: URLSearchParams) {
  const next = new URLSearchParams();

  for (const [key, value] of params.entries()) {
    next.set(key, isSensitiveKey(key) ? REDACTED : truncate(value, 120));
  }

  return next;
}

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

export function sanitizeUrlForSentry(url: string): string {
  try {
    const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(url);
    const parsed = new URL(url, "http://localhost");
    parsed.search = sanitizeQueryEntries(parsed.searchParams).toString();

    if (!isAbsolute) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return parsed.toString();
  } catch {
    return truncate(url, 240);
  }
}

export function sanitizeHeadersForSentry(
  headers: Headers | Record<string, unknown> | null | undefined
): Record<string, string> | undefined {
  if (!headers) return undefined;

  const entries =
    typeof Headers !== "undefined" && headers instanceof Headers
      ? Array.from(headers.entries())
      : Object.entries(headers);

  const sanitized = Object.fromEntries(
    entries.map(([key, value]) => [
      key,
      isSensitiveKey(key) ? REDACTED : truncate(String(value), 160),
    ])
  );

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function sanitizeStringForKey(key: string | undefined, value: string): string {
  if (key && isSensitiveKey(key)) {
    return REDACTED;
  }

  if (key && /(url|uri|href)$/i.test(key)) {
    return sanitizeUrlForSentry(value);
  }

  return truncate(value);
}

export function sanitizeForSentry(
  value: unknown,
  depth = 0,
  key?: string
): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (depth >= MAX_DEPTH) {
    return TRUNCATED;
  }

  if (typeof value === "string") {
    return sanitizeStringForKey(key, value);
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof URL) {
    return sanitizeUrlForSentry(value.toString());
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: truncate(value.message),
      stack: value.stack ? truncate(value.stack, 2400) : undefined,
    };
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeForSentry(item, depth + 1));
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).slice(
      0,
      MAX_KEYS
    );

    return Object.fromEntries(
      entries.map(([entryKey, entryValue]) => [
        entryKey,
        isSensitiveKey(entryKey)
          ? REDACTED
          : sanitizeForSentry(entryValue, depth + 1, entryKey),
      ])
    );
  }

  return truncate(String(value));
}

export function sanitizeSentryBreadcrumb<T>(breadcrumb: T): T {
  const mutableBreadcrumb = breadcrumb as
    | { data?: Record<string, unknown>; message?: string }
    | null;

  if (!mutableBreadcrumb) return breadcrumb;

  if (mutableBreadcrumb.data) {
    mutableBreadcrumb.data = sanitizeForSentry(mutableBreadcrumb.data) as Record<
      string,
      unknown
    >;
  }

  if (mutableBreadcrumb.message) {
    mutableBreadcrumb.message = truncate(mutableBreadcrumb.message, 300);
  }

  return breadcrumb;
}

export function sanitizeSentryEvent<T>(event: T): T {
  const mutableEvent = event as {
    request?: {
      url?: string;
      headers?: Record<string, unknown>;
      data?: unknown;
      query_string?: string | [string, string][];
      cookies?: Record<string, unknown>;
    };
    contexts?: Record<string, unknown>;
    extra?: Record<string, unknown>;
    breadcrumbs?: Array<{ data?: Record<string, unknown>; message?: string }>;
  };

  if (mutableEvent.request) {
    if (mutableEvent.request.url) {
      mutableEvent.request.url = sanitizeUrlForSentry(mutableEvent.request.url);
    }

    if (mutableEvent.request.headers) {
      mutableEvent.request.headers =
        sanitizeHeadersForSentry(mutableEvent.request.headers) || {};
    }

    if (mutableEvent.request.query_string) {
      const queryEntries = Array.isArray(mutableEvent.request.query_string)
        ? mutableEvent.request.query_string
        : new URLSearchParams(mutableEvent.request.query_string).entries();
      mutableEvent.request.query_string = sanitizeQueryEntries(
        new URLSearchParams(Array.from(queryEntries))
      ).toString();
    }

    if (mutableEvent.request.data !== undefined) {
      mutableEvent.request.data =
        typeof mutableEvent.request.data === "string"
          ? REDACTED
          : sanitizeForSentry(mutableEvent.request.data);
    }

    if (mutableEvent.request.cookies) {
      mutableEvent.request.cookies = sanitizeForSentry(
        mutableEvent.request.cookies
      ) as Record<
        string,
        unknown
      >;
    }
  }

  if (mutableEvent.contexts) {
    mutableEvent.contexts = sanitizeForSentry(mutableEvent.contexts) as Record<
      string,
      unknown
    >;
  }

  if (mutableEvent.extra) {
    mutableEvent.extra = sanitizeForSentry(mutableEvent.extra) as Record<
      string,
      unknown
    >;
  }

  if (mutableEvent.breadcrumbs) {
    mutableEvent.breadcrumbs = mutableEvent.breadcrumbs.map((breadcrumb) =>
      sanitizeSentryBreadcrumb(breadcrumb)
    );
  }

  return event;
}
