// lib/admin/apiClient.ts

/**
 * Admin API client (browser-side).
 * Uses same-origin cookies for auth (admin session cookie).
 * No passcode headers, no localStorage.
 */

export class AdminApiError extends Error {
  status: number;
  payload?: any;

  constructor(message: string, status: number, payload?: any) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function readJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function normalizeErrorMessage(payload: any, status: number) {
  const msg =
    payload?.error ||
    payload?.message ||
    (typeof payload === "string" ? payload : null) ||
    `Request failed (${status})`;

  return String(msg);
}

/**
 * JSON request helper.
 */
export async function adminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const payload = await readJsonSafe(res);

  if (!res.ok) {
    throw new AdminApiError(normalizeErrorMessage(payload, res.status), res.status, payload);
  }

  return payload as T;
}

/**
 * FormData helper (for uploads).
 * IMPORTANT: do not set Content-Type manually (browser sets boundary).
 */
export async function adminForm<T>(
  path: string,
  form: FormData,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    ...init,
    body: form,
    headers: {
      ...(init?.headers || {}),
    },
  });

  const payload = await readJsonSafe(res);

  if (!res.ok) {
    throw new AdminApiError(normalizeErrorMessage(payload, res.status), res.status, payload);
  }

  return payload as T;
}
