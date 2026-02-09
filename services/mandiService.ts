// src/services/mandiService.ts
import { API_BASE } from "./api";
import { apiFetch } from "./http";
import { getToken } from "./token";

export type Crop = "Tomato" | "Onion" | "Potato" | "Wheat" | "Rice" | "Maize";

export type MandiPriceDoc = {
  _id: string;
  crop: Crop;
  mandi?: string;
  locationName?: string;
  pricePerQuintal: number;
  updatedAt?: string;
  date?: string;
  isBestPrice?: boolean;
  quality?: string;
};

export type NearbyMandi = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distKm: number;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  count?: number;
  data?: T;
  mandis?: T;
  results?: T;
};

function toQuery(params: Record<string, any>) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");
}

function normalizeArray<T>(res: any): T[] {
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res?.data)) return res.data as T[];
  if (Array.isArray(res?.mandis)) return res.mandis as T[];
  if (Array.isArray(res?.results)) return res.results as T[];
  return [];
}

/** Attach auth token if available (fixes HTTP 401 on protected routes) */
async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * GET /api/mandi?crop=Tomato&sort=latest
 * Backend commonly returns: { success, count, data: [...] }
 */
export async function fetchMandiPrices(params: {
  crop?: Crop;
  sort?: "latest" | "price_desc";
}) {
  const qs = toQuery(params as any);
  const url = `${API_BASE}/mandi${qs ? `?${qs}` : ""}`;

  const res = await apiFetch<ApiEnvelope<MandiPriceDoc[]>>(url, {
    headers: {
      ...(await authHeaders()),
    },
  });

  return normalizeArray<MandiPriceDoc>(res);
}

/**
 * GET /api/mandi/nearby?lat=..&lng=..&distKm=50&limit=5
 *
 * Your backend response looks like:
 * {
 *   success: true,
 *   count: 3,
 *   data: [
 *     {
 *       _id: "Azadpur Mandi",
 *       locationName: "Azadpur, Delhi",
 *       coordinates: [77.12345, 28.6789],  // [lng, lat]
 *       distance: 11054.66                 // meters
 *     }
 *   ]
 * }
 *
 * This function converts it into:
 * { id, name, lat, lng, distKm }
 */
export async function fetchNearbyMandis(params: {
  lat: number;
  lng: number;
  distKm: number;
  limit: number;
}): Promise<NearbyMandi[]> {
  const qs = toQuery(params as any);

  // Your comment says backend is GET, so use GET first:
  const url = `${API_BASE}/mandi/nearby${qs ? `?${qs}` : ""}`;

  // NOTE: If your backend actually expects POST, I give POST fallback below.
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(await authHeaders()),
      },
    });

    const json: any = await readJsonSafe(res);

    const rawRows =
      (Array.isArray(json?.data) && json.data) ||
      (Array.isArray(json?.mandis) && json.mandis) ||
      (Array.isArray(json?.results) && json.results) ||
      (Array.isArray(json) && json) ||
      [];

    return rawRows.map((r: any, idx: number) => {
      // Extract coordinates - handle multiple backend formats
      const coords =
        r?.coordinates ?? r?.locationCoordinates ?? r?.location?.coordinates ?? r?.coords ?? [];
      const lng = Array.isArray(coords) ? Number(coords[0]) : Number(r?.lng ?? r?.longitude ?? 0);
      const lat = Array.isArray(coords) ? Number(coords[1]) : Number(r?.lat ?? r?.latitude ?? 0);

      // Extract distance - backend returns distanceKm directly or distance in meters
      const distKm = r?.distanceKm ?? (r?.distance ? r.distance / 1000 : 0);

      // Extract name - backend returns mandiName field
      const mandiName = r?.mandiName ?? r?.name ?? r?.locationName ?? r?.mandi ?? r?._id ?? "Unknown Mandi";

      // Extract id - backend returns mandiId
      const id = r?.mandiId ?? r?._id ?? r?.id ?? String(idx);

      return {
        id: String(id),
        name: String(mandiName),
        lat,
        lng,
        distKm: Number(distKm) || 0,
      };
    });
  } catch (e: any) {
    // Optional POST fallback if your backend is actually POST:
    console.log(
      "⚠️ GET /mandi/nearby failed, trying POST fallback...",
      e?.message,
    );

    const postUrl = `${API_BASE}/mandi/nearby`;
    const res2 = await fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify(params),
    });

    const json2: any = await readJsonSafe(res2);

    const rawRows2 =
      (Array.isArray(json2?.data) && json2.data) ||
      (Array.isArray(json2?.mandis) && json2.mandis) ||
      (Array.isArray(json2?.results) && json2.results) ||
      (Array.isArray(json2) && json2) ||
      [];

    return rawRows2.map((r: any, idx: number) => {
      // Extract coordinates - handle multiple backend formats
      const coords =
        r?.coordinates ?? r?.locationCoordinates ?? r?.location?.coordinates ?? r?.coords ?? [];
      const lng = Array.isArray(coords) ? Number(coords[0]) : Number(r?.lng ?? r?.longitude ?? 0);
      const lat = Array.isArray(coords) ? Number(coords[1]) : Number(r?.lat ?? r?.latitude ?? 0);

      // Extract distance - backend returns distanceKm directly or distance in meters
      const distKm = r?.distanceKm ?? (r?.distance ? r.distance / 1000 : 0);

      // Extract name - backend returns mandiName field
      const mandiName = r?.mandiName ?? r?.name ?? r?.locationName ?? r?.mandi ?? r?._id ?? "Unknown Mandi";

      // Extract id - backend returns mandiId
      const id = r?.mandiId ?? r?._id ?? r?.id ?? String(idx);

      return {
        id: String(id),
        name: String(mandiName),
        lat,
        lng,
        distKm: Number(distKm) || 0,
      };
    });
  }
}

async function readJsonSafe(res: Response) {
  const text = await res.text();

  // Helpful logs (keep these while debugging)
  console.log("🌐 HTTP", res.status, res.url);
  console.log("🌐 RAW(first 300):", text.slice(0, 300));

  if (text.trim().startsWith("<")) {
    // HTML response => wrong endpoint/method or server error page
    throw new Error(
      `API returned HTML (status ${res.status}). Check URL/method. Starts: ${text.slice(0, 40)}`,
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `API did not return valid JSON (status ${res.status}). Starts: ${text.slice(0, 40)}`,
    );
  }
}
