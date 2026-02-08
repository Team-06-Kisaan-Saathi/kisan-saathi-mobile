import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, } from "react-native";
import { useTranslation } from "react-i18next";
import { Stack, useRouter } from "expo-router";
import NavFarmer from "../components/navigation/NavFarmer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Get user name from AsyncStorage
    AsyncStorage.getItem("userName").then((name) => {
      if (name) setUserName(name);
    });
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <NavFarmer />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {t("farmer.welcome_user", {
                name: userName || t("farmer.default_user"),
              })}
            </Text>
            <Text style={styles.subtitle}>{t("farmer.tagline")}</Text>
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {/* Marketplace */}
            <DashboardTile
              iconBg="#c8e6c9"
              iconColor="#2e7d32"
              icon="storefront"
              title={t("farmer.marketplace")}
              onPress={() => router.push("/marketplace")}
            />

            {/* Live Auctions */}
            <DashboardTile
              iconBg="#ffcdd2"
              iconColor="#c62828"
              icon="hammer"
              title={t("farmer.live_auctions")}
              onPress={() => router.push("/live-auctions")}
            />

            {/* My Listings */}
            <DashboardTile
              iconBg="#bbdefb"
              iconColor="#1565c0"
              icon="list"
              title={t("farmer.my_listings")}
              onPress={() => router.push("/my-listings")}
            />

            {/* Add Crop */}
            <DashboardTile
              iconBg="#ffe0b2"
              iconColor="#e65100"
              icon="add-circle"
              title={t("farmer.add_crop")}
              onPress={() => router.push("/add-crop")}
            />

            {/* Messages */}
            <DashboardTile
              iconBg="#e1bee7"
              iconColor="#6a1b9a"
              icon="chatbubbles"
              title={t("farmer.messages")}
              onPress={() => router.push("/messages")}
            />

            {/* Alerts */}
            <DashboardTile
              iconBg="#ffccbc"
              iconColor="#d84315"
              icon="notifications"
              title={t("farmer.alerts")}
              onPress={() => router.push("/alerts")}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function DashboardTile({
  iconBg,
  iconColor,
  icon,
  title,
  onPress,
}: {
  iconBg: string;
  iconColor: string;
  icon: any;
  title: string;
  onPress: () => void;
}) {
  // Debug: log the colors
  console.log(`Tile: ${title}, iconBg: ${iconBg}, iconColor: ${iconColor}`);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: iconBg + "40" }, // 25% opacity pastel background for tile
        pressed && styles.tilePressed,
      ]}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 12,
          backgroundColor: iconBg,
        }}
      >
        <Ionicons name={icon} size={36} color={iconColor} />
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    alignItems: "flex-start",
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a4b84",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },

  tile: {
    width: "47%",
    aspectRatio: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  tilePressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  tileTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
});
