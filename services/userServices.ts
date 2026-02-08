import { API_BASE } from "./api";
import { apiFetch } from "./http";

export type MyLocationResponse = {
  success: boolean;
  location?: string;
  lat: number | null;
  lng: number | null;
  coordinates?: [number, number] | null; // [lng, lat]
};

export async function getMyLocation(token: string) {
  return apiFetch<MyLocationResponse>(`${API_BASE}/users/location`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateMyLocation(
  token: string,
  payload: { lat: number; lng: number; address?: string },
) {
  return apiFetch<any>(`${API_BASE}/users/location`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
