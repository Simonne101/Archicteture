const API_ORIGIN = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const API_BASE_URL = `${API_ORIGIN}/api/v1`;

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(status: number, errors: Record<string, string[]>, message: string) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Laravel Sanctum's SPA (stateful) mode authenticates via session cookies,
// not a Bearer token. Any state-changing request needs a fresh CSRF cookie
// first, whose value is then echoed back as the X-XSRF-TOKEN header.
let csrfCookieReady: Promise<void> | null = null;

function ensureCsrfCookie(): Promise<void> {
  csrfCookieReady ??= fetch(`${API_ORIGIN}/sanctum/csrf-cookie`, {
    credentials: "include",
  }).then(() => undefined);

  return csrfCookieReady;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const isFormData = options.body instanceof FormData;
  const isMutating = method !== "GET" && method !== "HEAD";

  if (isMutating) {
    await ensureCsrfCookie();
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(isMutating ? { "X-XSRF-TOKEN": readCookie("XSRF-TOKEN") ?? "" } : {}),
      ...options.headers,
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.errors ?? {},
      body?.message ?? `Erreur ${response.status}`,
    );
  }

  return body as T;
}
