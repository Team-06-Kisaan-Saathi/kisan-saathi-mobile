import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * NavFarmer Component
 *
 * Description:
 * Fixed navigation bar for Farmer users.
 * Provides route-based navigation and profile modal actions.
 *
 * Used In:
 * - Farmer Dashboard page (farmer-dashboard.tsx)
 *
 * Responsibilities:
 * - Highlight active route
 * - Handle role-based profile navigation
 * - Provide logout functionality
 * - Display fallback profile action modal
 *
 * Inputs:
 * - None (relies on router, pathname, AsyncStorage, and i18n context)
 *
 * Outputs:
 * - Renders top navigation UI
 * Note:
 * Assumes user role is stored in AsyncStorage under key "role".
 */


//  navigation component for Farmer role with role-based profile handling
export default function NavFarmer() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  // Utility to determine active route for dynamic icon and label styling
  const isActive = (route: string) => pathname === route;

  // Profile click: Farmer -> /farmer, Buyer -> do nothing (for now), Missing role -> open modal
  const handleProfilePress = async () => {
    try {
      const roleRaw = await AsyncStorage.getItem("role");
      // Normalize role value to avoid case and whitespace inconsistencies
      const role = (roleRaw || "").trim().toLowerCase();

      console.log(
        "Profile pressed. roleRaw =",
        roleRaw,
        " roleNormalized =",
        role,
      );

      // Redirect farmer users to farmer profile screen
      if (role === "farmer") {
        router.push("/farmer" as any);
        return;
      }

      // Buyer profile navigation placeholder (not implemented yet)
      if (role === "buyer") {
        console.log("ℹBuyer profile not implemented yet");
        return;
      }

      // If role missing/unknown, open the menu
      setProfileOpen(true);
    } catch (e) {
      console.log("❌ error reading role", e);
      setProfileOpen(true);
    }
  };

// Clears authentication data and safely redirects to login screen
  const handleLogout = async () => {
    try {
      // Remove stored authentication credentials
      await AsyncStorage.multiRemove(["token", "role"]);
    } catch (e) {
      // ignore
    } finally {
      setProfileOpen(false);
      // Replace navigation stack to prevent back navigation after logout
      router.replace("/login" as any);
    }
  };

  return (
    <>
      <View style={styles.bottomNav}>
        {/* Dashboard (Home) */}
        <NavItem
          icon="home-outline"
          activeIcon="home"
          label={t("nav_farmer.dashboard")}
          active={isActive("/farmer-dashboard")}
          onPress={() => router.push("/farmer-dashboard" as any)}
        />

        {/* AI Price Prediction */}
        <NavItem
          icon="analytics-outline"
          activeIcon="analytics"
          label={t("nav_farmer.ai_insights")}
          active={isActive("/market-insights")}
          onPress={() => router.push("/market-insights" as any)}
        />

        {/* Notifications */}
        <NavItem
          icon="notifications-outline"
          activeIcon="notifications"
          label={t("nav_farmer.notifications")}
          active={isActive("/notifications")}
          onPress={() => router.push("/notifications" as any)}
        />

        {/* Profile */}
        <NavItem
          icon="person-outline"
          activeIcon="person"
          label={t("nav_farmer.profile")}
          // highlight if modal open OR if you're on farmer page (optional)
          active={profileOpen || isActive("/farmer")}
          onPress={() => router.push("/farmer" as any)}
        />
      </View>

      {/* Profile Modal (fallback menu if role missing / for extra actions) */}
      <Modal
        visible={profileOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setProfileOpen(false)}
        >
          <View style={styles.profileMenu}>
            <Text style={styles.menuTitle}>{t("nav_farmer.profile")}</Text>

            <MenuItem
              icon="person-circle-outline"
              label={t("nav_farmer.edit_profile")}
              onPress={() => {
                setProfileOpen(false);
                router.push("/profile" as any);
              }}
            />

            <MenuItem
              icon="settings-outline"
              label={t("nav_farmer.edit_preferences")}
              onPress={() => {
                setProfileOpen(false);
                router.push("/farmer-preferences" as any);
              }}
            />

            <View style={styles.divider} />

            <MenuItem
              icon="log-out-outline"
              label={t("nav_farmer.logout")}
              danger
              onPress={handleLogout}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function NavItem({
  icon,
  activeIcon,
  label,
  active,
  onPress,
}: {
  icon: any;
  activeIcon: any;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name={active ? activeIcon : icon}
        size={26}
        color={active ? "#2e7d32" : "#64748b"}
      />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={22}
        color={danger ? "#dc2626" : "#475569"}
        style={{ marginRight: 12 }}
      />
      <Text style={[styles.menuText, danger && styles.textDanger]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    minWidth: 64,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
    color: "#64748b",
    fontWeight: "600",
  },
  navLabelActive: {
    color: "#2e7d32",
    fontWeight: "700",
  },

  // Profile Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  profileMenu: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  menuText: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  textDanger: {
    color: "#dc2626",
  },
  divider: {
    height: 1,
    backgroundColor: "#cbd5e0",
    marginVertical: 8,
  },
});