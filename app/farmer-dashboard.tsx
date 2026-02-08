import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NavFarmer from "../components/navigation/NavFarmer";

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("farmer.welcome_msg")}</Text>
          <Text style={styles.subtitle}>{t("farmer.welcome_sub")}</Text>
        </View>

        {/* 2-Column Grid */}
        <View style={styles.grid}>
          {/* Marketplace */}
          <Tile
            icon="basket-outline"
            color="#2e7d32" // Green
            title={t("farmer.marketplace") || "Marketplace"}
            onPress={() => router.push("/marketplace")}
          />

          {/* Live Auctions */}
          <Tile
            icon="hammer-outline"
            color="#d32f2f" // Red
            title={t("farmer.live_auctions") || "Live Auctions"}
            onPress={() => router.push("/live-auctions")}
          />

          {/* My Inventory */}
          <Tile
            icon="list-outline"
            color="#1565c0" // Blue
            title={t("farmer.my_listings") || "My Inventory"}
            onPress={() => router.push("/my-listings")}
          />

          {/* Add Crop */}
          <Tile
            icon="add-circle-outline"
            color="#f97316" // Orange
            title={t("farmer.add_crop") || "Add Crop"}
            onPress={() => router.push("/add-crop")}
          />

          {/* Messages */}
          <Tile
            icon="chatbubbles-outline"
            color="#7b1fa2" // Purple
            title={t("farmer.messages") || "Messages"}
            onPress={() => router.push("/messages" as any)} // Placeholder
          />

          {/* Expiry Alerts */}
          <Tile
            icon="alarm-outline"
            color="#c62828" // Dark Red
            title={t("farmer.alerts") || "Expiry Alerts"}
            onPress={() => router.push("/notifications" as any)} // Using notifications for alerts
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom Layout handles Nav */}
      <NavFarmer />
    </View>
  );
}

function Tile({
  icon,
  color,
  title,
  onPress,
}: {
  icon: any;
  color: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 90, // Space for bottom nav
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  tile: {
    width: "47%", // ~Half width minus gap
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    aspectRatio: 1, // Square tiles
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tilePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
});
