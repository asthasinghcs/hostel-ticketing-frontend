import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

const storage = new Map();
globalThis.sessionStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = new EventTarget();
const { api, hasSession, saveSession, ApiError } =
  await import("../src/api.js");
const originalFetch = globalThis.fetch;
beforeEach(() => {
  storage.clear();
  saveSession(null);
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});

const response = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("authenticated calls send the session token and JSON", async () => {
  saveSession("opaque-token");
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "http://localhost:5000/api/tickets");
    assert.equal(options.headers.Authorization, "Bearer opaque-token");
    assert.equal(options.body, JSON.stringify({ description: "Issue" }));
    return response({ id: 1 });
  };
  assert.deepEqual(
    await api("/api/tickets", {
      method: "POST",
      body: { description: "Issue" },
    }),
    { id: 1 },
  );
});

test("login never sends an existing token or invalidates a valid session", async () => {
  saveSession("active-session");
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, undefined);
    return response({ error: "Invalid email or password." }, 401);
  };
  await assert.rejects(
    api("/api/login", { method: "POST", body: {}, publicRequest: true }),
    (error) => error.status === 401,
  );
  assert.equal(hasSession(), true);
});

test("expired sessions clear browser storage and notify the UI", async () => {
  saveSession("expired");
  let events = 0;
  const handler = () => {
    events += 1;
  };
  window.addEventListener("hostelcare:expired", handler);
  globalThis.fetch = async () => response({ error: "Session expired" }, 401);
  await assert.rejects(
    api("/api/me"),
    (error) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(hasSession(), false);
  assert.equal(storage.size, 0);
  assert.equal(events, 1);
  window.removeEventListener("hostelcare:expired", handler);
});

test("a late 401 from an old request cannot clear a new session", async () => {
  saveSession("old");
  globalThis.fetch = async () => {
    saveSession("new");
    return response({ error: "Expired" }, 401);
  };
  await assert.rejects(api("/api/me"));
  assert.equal(storage.get("hostelcare.session"), "new");
});

test("network failures produce a readable error", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };
  await assert.rejects(
    api("/api/tickets"),
    (error) =>
      error.status === 0 && error.message.includes("Check your connection"),
  );
});

test("non-JSON server failures do not leak a JSON parsing error", async () => {
  globalThis.fetch = async () =>
    new Response("<html>Unavailable</html>", { status: 503 });
  await assert.rejects(
    api("/api/tickets"),
    (error) => error.status === 503 && error.message.includes("503"),
  );
});

test("canceled requests retain cancellation for unmounted screens", async () => {
  const controller = new AbortController();
  globalThis.fetch = async (_url, options) =>
    new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () =>
        reject(new DOMException("Aborted", "AbortError")),
      );
    });
  const pending = api("/api/tickets", { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, (error) => error.name === "AbortError");
});

test("slow requests time out with a retry message", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  globalThis.fetch = async (_url, options) =>
    new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () =>
        reject(new DOMException("Aborted", "AbortError")),
      );
    });
  const pending = api("/api/tickets");
  t.mock.timers.tick(45000);
  await assert.rejects(pending, (error) =>
    error.message.includes("took too long"),
  );
  t.mock.timers.reset();
});
