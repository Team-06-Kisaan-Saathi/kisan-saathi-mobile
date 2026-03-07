export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 12000,
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await res.text();

    // Helpful error if backend returned HTML or non-JSON
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      // Not JSON
      throw new Error(`Non-JSON response: ${text.slice(0, 200)}`);
    }
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error(`Timeout after ${timeoutMs}ms. URL: ${url}`);
    }
    // This is the one you are seeing:
    // TypeError: Network request failed
    throw new Error(`${e?.message || "Network request failed"} | URL: ${url}`);
  } finally {
    clearTimeout(id);
  }
}
