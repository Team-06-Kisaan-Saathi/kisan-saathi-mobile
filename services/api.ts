// ─── Single source of truth for backend connection ───
import { Platform } from "react-native";

// ─── Single source of truth for backend connection ───
// For local development, Android Emulator needs 10.0.2.2
export const HOST = Platform.OS === "android" ? "10.12.252.10" : "localhost";
export const PORT = "5001";
export const API_BASE = `http://${HOST}:${PORT}/api`;
export const UPLOADS_URL = `http://${HOST}:${PORT}/uploads/`;
export const SOCKET_URL = `http://${HOST}:${PORT}`;

export const ENDPOINTS = {
    AUTH: {
        SEND_OTP: `${API_BASE}/auth/send-otp`,
        VERIFY_OTP: `${API_BASE}/auth/verify-otp`,
        SIGNUP: `${API_BASE}/auth/signup-complete`,
        LOGIN: `${API_BASE}/auth/login`,
    },
    USER: {
        PROFILE: `${API_BASE}/users/profile`,
        LOCATION: `${API_BASE}/users/location`,
        VERIFY: `${API_BASE}/users/verify`,
    },
    INVENTORY: {
        MINE: `${API_BASE}/inventory/mine`,
        CREATE: `${API_BASE}/inventory`,
        ITEM: (id: string) => `${API_BASE}/inventory/${id}`,
    },
    MARKET: {
        MANDI: `${API_BASE}/mandi`,
        NEARBY: `${API_BASE}/mandi/nearby`,
        WATCHLIST: `${API_BASE}/watchlist`,
        LOCATIONS: `${API_BASE}/locations`,
    },
    CHAT: {
        INIT: `${API_BASE}/chat/init`,
        MY_CHATS: `${API_BASE}/chat/my-chats`,
        MESSAGES: (id: string) => `${API_BASE}/chat/${id}`,
        UPLOAD: `${API_BASE}/chat/upload`,
    },
    DEALS: {
        CREATE: `${API_BASE}/deals`,
        ACTION: (id: string, action: string) => `${API_BASE}/deals/${id}/${action}`,
        GET: (id: string) => `${API_BASE}/deals/${id}`,
    },
    INVOICE: (dealId: string) => `${API_BASE}/invoices/${dealId}/download`,
};
