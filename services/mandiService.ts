import { ENDPOINTS } from "./api";
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

export async function fetchMandiPrices(params: {
  crop?: Crop;
  sort?: "latest" | "price_desc";
  limit?: number;
  location?: string;
}) {
  const qs = toQuery(params as any);
  const url = `${ENDPOINTS.MARKET.MANDI}${qs ? `?${qs}` : ""}`;

  const res = await apiFetch<any>(url, {
    method: "GET",
  });

  return normalizeArray<MandiPriceDoc>(res);
}

export async function fetchNearbyMandis(params: {
  lat: number;
  lng: number;
  distKm: number;
  limit: number;
}): Promise<NearbyMandi[]> {
  const qs = toQuery(params as any);
  const url = `${ENDPOINTS.MARKET.NEARBY}${qs ? `?${qs}` : ""}`;

  try {
    const res = await apiFetch<any>(url, {
      method: "GET",
    });

    const rawRows = normalizeArray<any>(res);

    return rawRows.map((r: any, idx: number) => {
      const coords =
        r?.coordinates ?? r?.locationCoordinates ?? r?.coords ?? [];
      const lng = Array.isArray(coords) ? Number(coords[0]) : Number(r?.lng);
      const lat = Array.isArray(coords) ? Number(coords[1]) : Number(r?.lat);

      const meters = Number(r?.distance ?? r?.distMeters ?? r?.meters ?? 0);
      const km = meters ? meters / 1000 : Number(r?.distKm ?? 0);

      return {
        id: String(r?._id ?? r?.id ?? idx),
        name: String(r?.locationName ?? r?.name ?? r?.mandi ?? "Unknown"),
        lat,
        lng,
        distKm: km,
      };
    });
  } catch (e: any) {
    // POST Fallback for local dev if GET is fussy
    console.log("⚠️ GET /mandi/nearby failed, trying POST fallback...");
    const res2 = await apiFetch<any>(ENDPOINTS.MARKET.NEARBY, {
      method: "POST",
      body: JSON.stringify(params),
    });

    const rawRows2 = normalizeArray<any>(res2);

    return rawRows2.map((r: any, idx: number) => {
      const coords = r?.coordinates ?? r?.locationCoordinates ?? r?.coords ?? [];
      const lng = Array.isArray(coords) ? Number(coords[0]) : Number(r?.lng);
      const lat = Array.isArray(coords) ? Number(coords[1]) : Number(r?.lat);
      const meters = Number(r?.distance ?? r?.distMeters ?? r?.meters ?? 0);
      const km = meters ? meters / 1000 : Number(r?.distKm ?? 0);

      return {
        id: String(r?._id ?? r?.id ?? idx),
        name: String(r?.locationName ?? r?.name ?? r?.mandi ?? "Unknown"),
        lat,
        lng,
        distKm: km,
      };
    });
  }
}
