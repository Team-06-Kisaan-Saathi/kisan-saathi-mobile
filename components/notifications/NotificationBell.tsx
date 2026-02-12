import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { Bell } from "lucide-react-native";

/**
 * NotificationBell Component
 *
 * Description:
 * Displays a bell icon with unread notification badge.
 * Opens a dropdown-style modal showing notification list.
 *
 * Used In:
 * - Farmer navigation bar (e.g., NavFarmer component)
 *
 * Responsibilities:
 * - Show unread notification count
 * - Mark notifications as read when opened
 * - Toggle notification modal visibility
 *
 * Inputs:
 * - None (currently uses local state; can be extended to accept props/API data)
 *
 * Outputs:
 * - Renders bell icon with badge
 * - Triggers UI state changes (modal visibility & read status)
 */


export default function NotificationBell() {
  // Controls visibility of notification modal
  const [visible, setVisible] = useState(false);

  // Local notification state (mock data — replace with API integration later)
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New bid on your Tomato listing", read: false },
    { id: 2, text: "Mandi price updated for Onion", read: false },
  ]);

  // Derived state: calculate number of unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Opens modal and marks all notifications as read
  const openNotifications = () => {
    setVisible(true);
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      {/* Bell icon with unread badge indicator */}
      <TouchableOpacity onPress={openNotifications} style={styles.bellWrapper}>
        <Bell size={26} color="#ffffff" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notification dropdown Modal */}
      <Modal transparent visible={visible} animationType="fade">
        {/* Close modal when tapping outside notification box */}
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.title}>Notifications</Text>

            {notifications.length === 0 ? (
              <Text style={styles.empty}>No notifications</Text>
            ) : (
              notifications.map(n => (
                <Text key={n.id} style={styles.item}>
                  • {n.text}
                </Text>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellWrapper: {
    marginRight: 25,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 16,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 10,
  },
  modal: {
    backgroundColor: "#fff",
    width: 260,
    borderRadius: 10,
    padding: 12,
    elevation: 5,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
    color: "#1a4b84",
  },
  item: {
    fontSize: 14,
    marginVertical: 4,
    color: "#333",
  },
  empty: {
    color: "#777",
    fontSize: 14,
  },
});
