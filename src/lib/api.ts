/**
 * A-12: Centralised API client.
 *
 * Replaces direct `fetch()` calls in components with a single module that
 * handles:
 *   - JSON request/response encoding
 *   - Configurable timeout (default 30s)
 *   - Optional retry on 5xx / network errors (default 1 retry, 500ms backoff)
 *   - Error normalisation: callers receive a typed `ApiError` instead of
 *     raw `Response` objects to inspect.
 *   - Request ID extraction for log correlation with the server.
 *
 * Usage:
 *   const plan = await postJSON<WorkoutPlan>("/api/generate-plan", onboardingInput);
 */
export interface ApiError {
  status: number;
  message: string;
  requestId?: string;
  details?: unknown;
}

interface PostJSONOptions {
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
}

/**
 * POST a JSON body to an API endpoint and return the parsed JSON response.
 * Throws `ApiError` on any non-2xx response or network failure.
 */
export async function postJSON<T>(
  path: string,
  body: unknown,
  options: PostJSONOptions = {},
): Promise<T> {
  const { timeoutMs = 30_000, retries = 1, signal } = options;
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Merge the caller's signal with our timeout signal
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const text = await res.text();
      let json: unknown = null;
      try {
        json = JSON.parse(text);
      } catch {
        /* leave as text */
      }

      if (!res.ok) {
        const errBody = (json ?? { error: text }) as { error?: string; requestId?: string };
        lastError = {
          status: res.status,
          message: errBody.error ?? `Request failed with status ${res.status}`,
          requestId: errBody.requestId,
          details: json,
        };
        // Retry on 5xx; don't retry on 4xx (client error)
        if (res.status < 500 || attempt === retries) {
          throw lastError;
        }
        // Exponential backoff before retry
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
        continue;
      }

      return json as T;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        lastError = {
          status: 408,
          message: `Request timed out after ${timeoutMs}ms`,
        };
      } else if ((err as ApiError).status) {
        throw err; // already an ApiError from above
      } else {
        lastError = {
          status: 0,
          message: err instanceof Error ? err.message : String(err),
        };
      }
      if (attempt === retries) {
        throw lastError;
      }
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError ?? new Error("postJSON: unreachable");
}

/**
 * GET a JSON endpoint. Same error-handling semantics as `postJSON`.
 */
export async function getJSON<T>(path: string, options: PostJSONOptions = {}): Promise<T> {
  const { timeoutMs = 30_000, signal } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(path, { signal: controller.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let json: unknown = null;
      try {
        json = JSON.parse(text);
      } catch {
        /* leave as text */
      }
      const errBody = (json ?? { error: text }) as { error?: string; requestId?: string };
      throw {
        status: res.status,
        message: errBody.error ?? `Request failed with status ${res.status}`,
        requestId: errBody.requestId,
        details: json,
      } as ApiError;
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw {
        status: 408,
        message: `Request timed out after ${timeoutMs}ms`,
      } as ApiError;
    }
    if ((err as ApiError).status) throw err;
    throw {
      status: 0,
      message: err instanceof Error ? err.message : String(err),
    } as ApiError;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Returns true if the given error is an `ApiError` (vs a generic Error).
 */
export function isApiError(err: unknown): err is ApiError {
  return typeof err === "object" && err !== null && "status" in err && "message" in err;
}
