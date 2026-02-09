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

export type UserProfile = {
  name?: string;
  phone?: string;
  role?: string;
  language?: string;
  location?: any;
};

export async function registerUser(payload: {
  phone: string;
  pin: string;
  name: string;
  role: string;
  language?: string;
  location?: { lat: number; lng: number; address?: string };
}) {
  // 1. Create User (Signup)
  const signupRes = await apiFetch<any>(`${API_BASE}/auth/signup-complete`, {
    method: "POST",
    body: JSON.stringify({
      phone: payload.phone,
      pin: payload.pin,
      name: payload.name,
      role: payload.role,
    }),
  });

  if (!signupRes.success || !signupRes.token) {
    throw new Error(signupRes.message || "Signup failed");
  }

  const token = signupRes.token;

  // 2. Set Language
  if (payload.language) {
    await apiFetch<any>(`${API_BASE}/users/profile`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ language: payload.language }),
    });
  }

  // 3. Set Location
  if (payload.location) {
    console.log("📍 Saving location to backend...", payload.location);
    const body = {
      lat: payload.location.lat,
      lng: payload.location.lng,
      address: payload.location.address,
    };

    await apiFetch<any>(`${API_BASE}/users/location`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  }

  return signupRes;
}

export async function getProfile(token: string) {
  return apiFetch<any>(`${API_BASE}/users/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateProfile(
  token: string,
  payload: { name?: string; language?: string; location?: any },
) {
  return apiFetch<any>(`${API_BASE}/users/profile`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function updateLocation(
  token: string,
  payload: {
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
    address?: string;
  },
) {
  const lat = payload.lat ?? payload.latitude;
  const lng = payload.lng ?? payload.longitude;

  const body = { lat, lng, address: payload.address };

  console.log("📍 [updateLocation] Sending body:", JSON.stringify(body));

  return apiFetch<any>(`${API_BASE}/users/location`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}
