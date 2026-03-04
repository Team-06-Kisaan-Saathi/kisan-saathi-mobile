import { apiFetch } from "./http";
import { ENDPOINTS, API_BASE } from "./api";

export const adminService = {
    getStats: async () => {
        return apiFetch<any>(ENDPOINTS.ADMIN.STATS);
    },

    getRecentActivities: async () => {
        return apiFetch<any>(ENDPOINTS.ADMIN.ACTIVITIES);
    },

    getUsers: async (role?: string) => {
        return apiFetch<any>(`${ENDPOINTS.USER.PROFILE.replace("/profile", "")}${role ? `?role=${role}` : ""}`);
    },

    updateUserStatus: async (userId: string, status: string) => {
        return apiFetch<any>(`${ENDPOINTS.USER.PROFILE.replace("/profile", "/status")}/${userId}`, {
            method: "PUT",
            body: JSON.stringify({ status })
        });
    },

    getListings: async (status?: string) => {
        // Updated to use a more generic query if needed, or stick to users for now
        return apiFetch<any>(`${API_BASE}/inventory${status ? `?status=${status}` : ""}`);
    },

    getAllOrders: async () => {
        return apiFetch<any>(ENDPOINTS.ADMIN.ORDERS);
    },

    approveListing: async (listingId: string) => {
        return apiFetch<any>(`${API_BASE}/inventory/${listingId}/approve`, {
            method: "POST"
        });
    },
    getAnalytics: async () => {
        return apiFetch<any>(ENDPOINTS.ADMIN.ANALYTICS);
    }
};
