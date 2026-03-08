import { io, Socket } from "socket.io-client";
import { SOCKET_URL, ENDPOINTS } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./http";

class NotificationService {
    private socket: Socket | null = null;
    private listeners: ((unreadCount: number) => void)[] = [];
    private unreadCount: number = 0;

    async init() {
        if (this.socket?.connected) return;

        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");

        if (!token || !userId) {
            console.warn("🔔 NotificationService: Missing token or userId, skipping init");
            return;
        }

        console.log("🔔 NotificationService: Initializing for user", userId);

        // Initialize socket
        this.socket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: { token }
        });

        this.socket.on("connect", () => {
            console.log("🔔 NotificationService: Connected! ID:", this.socket?.id);
            this.socket?.emit("joinNotifications", { userId });
            console.log("🔔 NotificationService: Emitted joinNotifications for", userId);
        });

        this.socket.on("connect_error", (err) => {
            console.error("🔔 NotificationService: Connection Error:", err.message);
        });

        this.socket.on("new_notification", (notification) => {
            console.log("New notification received:", notification);
            this.unreadCount += 1;
            this.notifyListeners();
        });

        // Initial fetch
        this.fetchUnreadCount();
    }

    async fetchUnreadCount() {
        try {
            const res = await apiFetch<{ success: boolean; count: number }>(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
            if (res.success) {
                console.log("🔔 NotificationService: Unread count updated:", res.count);
                this.unreadCount = res.count;
                this.notifyListeners();
            }
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    }

    subscribe(callback: (unreadCount: number) => void) {
        this.listeners.push(callback);
        callback(this.unreadCount);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(callback => callback(this.unreadCount));
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getUnreadCount() {
        return this.unreadCount;
    }
}

export const notificationService = new NotificationService();
