import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Stack, useRouter } from "expo-router";
import NavFarmer from "../components/navigation/NavFarmer";
import { Ionicons } from "@expo/vector-icons";

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <NavFarmer />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="leaf" size={28} color="#fff" />
            </View>
            <Text style={styles.title}>{t("farmer.welcome_msg")}</Text>
            <Text style={styles.subtitle}>
              {t("farmer.welcome_sub")}
            </Text>
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {/* Add Crop */}
            <DashboardTile
              bg="#34a853"
              icon="leaf-outline"
              title={t("farmer.add_crop")}
              sub={t("farmer.add_crop_sub")}
              onPress={() => router.push("/add-crop")}
            />

            {/* My Listings */}
            <DashboardTile
              bg="#3b82f6"
              icon="list-outline"
              title={t("farmer.my_listings")}
              sub={t("farmer.my_listings_sub")}
              onPress={() => router.push("/my-listings")}
            />

            {/* Mandi Prices */}
            <DashboardTile
              bg="#f97316"
              icon="trending-up-outline"
              title={t("farmer.mandi_prices")}
              sub={t("farmer.mandi_prices_sub")}
              onPress={() => router.push("/mandi-prices")}
            />

            {/* Live Auctions */}
            <DashboardTile
              bg="#ef4444"
              icon="hammer-outline"
              title={t("farmer.live_auctions")}
              sub={t("farmer.live_auctions_sub")}
              onPress={() => router.push("/live-auctions")}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function DashboardTile({
  bg,
  icon,
  title,
  sub,
  onPress,
}: {
  bg: string;
  icon: any;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: bg },
        pressed && styles.tilePressed,
      ]}
    >
      <Ionicons name={icon} size={32} color="#fff" />
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSub}>{sub}</Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6faf7",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2e7d32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a4b84",
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },

  grid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 16,
  },

  tile: {
  width: "90%",         
  maxWidth: 320,        
  height: 160,
  borderRadius: 18,
  padding: 16,
  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 6,
  },


  tilePressed: {
    transform: [{ translateY: -6 }],
    shadowOpacity: 0.25,
  },

  tileTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
  },

  tileSub: {
    fontSize: 12,
    color: "#f0fdf4",
    marginTop: 6,
    textAlign: "center",
  },
});
