// src/services/mandiService.ts
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
};

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? "http://10.12.252.131:5001/api/mandi";

function toQuery(params: Record<string, any>) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");
}

export async function fetchMandiPrices(params: {
  crop?: Crop;
  sort?: "latest" | "price_desc";
}) {
  const qs = toQuery(params as any);
  const url = `${API_BASE}${qs ? `?${qs}` : ""}`;

  const res: any = await apiFetch<any>(url);
  return Array.isArray(res?.data) ? (res.data as MandiPriceDoc[]) : [];
}

// GET /api/mandi/nearby?lat=..&lng=..&distKm=50&limit=5
export async function fetchNearbyMandis(params: {
  lat: number;
  lng: number;
  distKm?: number;
  limit?: number;
}) {
  const qs = toQuery(params as any);
  const url = `${API_BASE}/nearby${qs ? `?${qs}` : ""}`;
  return apiFetch<any[]>(url);
}
