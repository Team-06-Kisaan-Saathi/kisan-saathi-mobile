// src/services/mandiService.ts
import { API_BASE } from "./api";
import { apiFetch } from "./http";

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

  const res = await apiFetch<ApiEnvelope<MandiPriceDoc[]>>(url);
  return normalizeArray<MandiPriceDoc>(res);
}

/**
 * GET /api/mandi/nearby?lat=..&lng=..&distKm=50&limit=5
 * Backend commonly returns: { success, count, data: [...] }
 * Each item may contain coordinates: [lng, lat]
 */
export async function fetchNearbyMandis(params: {
  lat: number;
  lng: number;
  distKm?: number;
  limit?: number;
}) {
  const qs = toQuery(params as any);
  const url = `${API_BASE}/mandi/nearby${qs ? `?${qs}` : ""}`;

  const res = await apiFetch<ApiEnvelope<any[]>>(url);
  const rows = normalizeArray<any>(res);

  // Map backend shape -> frontend-friendly shape
  const out: NearbyMandi[] = rows
    .map((m: any) => {
      const coordsArr = Array.isArray(m.coordinates) ? m.coordinates : null; // [lng, lat]
      const lat = Number(m.lat ?? (coordsArr ? coordsArr[1] : undefined));
      const lng = Number(m.lng ?? (coordsArr ? coordsArr[0] : undefined));

      return {
        id: String(m.mandiId ?? m._id ?? m.id ?? m.mandi ?? ""),
        name: String(m.mandiName ?? m.locationName ?? m.name ?? "Unknown"),
        lat,
        lng,
        distKm: Number(m.distanceKm ?? m.distKm ?? 0),
      };
    })
    .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));

  return out;
}
