const env = import.meta.env || {};
const API = (
  env.VITE_API_URL ||
  (env.PROD
    ? "https://hostel-ticketing-backend.onrender.com"
    : "http://localhost:5000")
).replace(/\/$/, "");
const KEY = "hostelcare.session";
let token = null;
try {
  token = sessionStorage.getItem(KEY);
} catch {
  /* In-memory sessions still work when storage is unavailable. */
}

export function hasSession() {
  return Boolean(token);
}
export function saveSession(value) {
  token = value;
  try {
    if (value) sessionStorage.setItem(KEY, value);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* Storage may be disabled by the browser. */
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function api(
  path,
  { method = "GET", body, signal, publicRequest = false } = {},
) {
  const requestToken = token;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 45000);
  try {
    const response = await fetch(API + path, {
      method,
      cache: "no-store",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(!publicRequest && requestToken
          ? { Authorization: `Bearer ${requestToken}` }
          : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (response.status === 401 && !publicRequest && token === requestToken) {
      saveSession(null);
      window.dispatchEvent(new Event("hostelcare:expired"));
    }
    if (!response.ok)
      throw new ApiError(
        data?.error || `Request failed (${response.status}). Please retry.`,
        response.status,
      );
    if (data === null)
      throw new ApiError(
        "The server returned an unreadable response. Please retry.",
        response.status,
      );
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timedOut)
      throw new ApiError(
        "The server took too long to respond. Please retry; it may be waking up.",
        0,
      );
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Could not reach the server. Check your connection and retry.",
      0,
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
