import React, { useState } from "react";
import NotificationBell from "../notifications/NotificationBell";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

export default function NavFarmer() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.navFarmer}>
      {/* LEFT: Scrollable Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.navLeftContent}
      >
        <NavItem label={t("nav_farmer.dashboard")} onPress={() => router.push("/farmer-dashboard")} />
        <NavItem label={t("nav_farmer.my_listings")} onPress={() => router.push("/my-listings")} />
        <NavItem label={t("nav_farmer.add_crop")} onPress={() => router.push("/add-crop")} />
        <NavItem label={t("nav_farmer.mandi_prices")} onPress={() => router.push("/mandi-prices")} />
        <NavItem label={t("nav_farmer.ai_insights")} onPress={() => router.push("/ai-insights")} />
        <NavItem label={t("nav_farmer.live_auctions")} onPress={() => router.push("/live-auctions")} />
      </ScrollView>

      {/* RIGHT: Notification + Profile */}
      <View style={styles.navRight}>
        <NotificationBell />

        <TouchableOpacity onPress={() => setOpen(!open)} activeOpacity={0.7}>
          <Ionicons name="person-circle-outline" size={34} color="#bbf7d0" />
        </TouchableOpacity>

        {open && (
          <View style={styles.profileDropdown}>
            <DropdownItem
              label={t("nav_farmer.edit_profile")}
              onPress={() => {
                setOpen(false);
                router.push("/edit-profile");
              }}
            />

            <DropdownItem
              label={t("nav_farmer.edit_preferences")}
              onPress={() => {
                setOpen(false);
                router.push("/farmer-preferences");
              }}
            />

            <View style={styles.dropdownDivider} />

            <DropdownItem
              label={t("nav_farmer.logout")}
              danger
              onPress={() => {
                setOpen(false);
                router.replace("/login");
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

/* 🔹 Reusable Nav Item */
function NavItem({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.navText}>{label}</Text>
    </TouchableOpacity>
  );
}

/* 🔹 Reusable Dropdown Item */
function DropdownItem({
  label,
  onPress,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.dropdownButton} onPress={onPress}>
      <Text style={[styles.dropdownText, danger && styles.logoutText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  navFarmer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a4b84",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 3,
    borderBottomColor: "#81c784",
    elevation: 10,
    zIndex: 1000,
  },

  navLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    paddingRight: 12,
  },

  navItem: {
    paddingVertical: 8,
  },

  navText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fdf5e6",
  },

  navRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    position: "relative",
  },

  profileDropdown: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 220,
    backgroundColor: "#fdfbf7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 12,
    zIndex: 2000,
  },

  dropdownButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },

  dropdownText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a365d",
  },

  dropdownDivider: {
    height: 1,
    backgroundColor: "#cbd5e0",
  },

  logoutText: {
    color: "#c53030",
  },
});
