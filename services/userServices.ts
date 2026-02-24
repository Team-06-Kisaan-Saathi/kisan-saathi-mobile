import { ENDPOINTS } from "./api";
import { apiFetch } from "./http";

export type MyLocationResponse = {
  success: boolean;
  location?: string;
  lat: number | null;
  lng: number | null;
  coordinates?: [number, number] | null; // [lng, lat]
};

export async function getMyLocation() {
  return apiFetch<MyLocationResponse>(ENDPOINTS.USER.LOCATION, {
    method: "GET",
  });
}

export async function registerUser(payload: {
  phone: string;
  pin: string;
  name: string;
  role: string;
  language?: string;
  location?: { lat: number; lng: number; address?: string };
}) {
  // 1. Create User (Signup)
  const signupRes = await apiFetch<any>(ENDPOINTS.AUTH.SIGNUP, {
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
    await apiFetch<any>(ENDPOINTS.USER.PROFILE, {
      method: "PUT",
      body: JSON.stringify({ language: payload.language }),
    });
  }

  // 3. Set Location
  if (payload.location) {
    const body = {
      lat: payload.location.lat,
      lng: payload.location.lng,
      address: payload.location.address,
    };

    await apiFetch<any>(ENDPOINTS.USER.LOCATION, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  return signupRes;
}

export type UserProfile = {
  name?: string;
  phone?: string;
  role?: string;
  language?: string;
  location?: any;
};

export async function getProfile() {
  return apiFetch<any>(ENDPOINTS.USER.PROFILE, {
    method: "GET",
  });
}

export async function updateProfile(
  payload: { name?: string; language?: string; location?: any },
) {
  return apiFetch<any>(ENDPOINTS.USER.PROFILE, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateLocation(
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

  return apiFetch<any>(ENDPOINTS.USER.LOCATION, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Request user verification */
export async function requestVerification(
  payload: { aadhaarNumber: string; panNumber: string },
) {
  return apiFetch<any>(ENDPOINTS.USER.VERIFY, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Discovery: Get all users (farmers/buyers) */
export async function getUsers() {
  const url = ENDPOINTS.USER.PROFILE.replace("/profile", "");
  return apiFetch<any>(url, {
    method: "GET",
  });
}

/** Public View: Get specific user details */
export async function getPublicProfile(id: string) {
  const url = ENDPOINTS.USER.PROFILE.replace("/profile", "/public") + `/${id}`;
  return apiFetch<any>(url, {
    method: "GET",
  });
}
