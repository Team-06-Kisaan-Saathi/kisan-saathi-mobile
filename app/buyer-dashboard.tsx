import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import NavBuyer from "../components/navigation/NavBuyer";
// import VoiceNavBtn from "../components/VoiceNavBtn"; // Disabled - requires native module build

/**
 * BuyerDashboard Page
 *
 * Description:
 * Main landing dashboard for Buyer role.
 * Displays various auction and marketplace options for buyers.
 *
 * Loaded When:
 * - User selects "Buyer" role
 * - Navigates to /buyer-dashboard route
 *
 * Responsibilities:
 * - Render navigation bar (NavBuyer)
 * - Provide Logout functionality
 * - Provide quick navigation to buyer-specific features (Marketplace, Auctions, Bids, etc.)
 *
 * Dependencies:
 * - NavBuyer component
 * - expo-router navigation
 * - i18next for translations
 *
 * Inputs:
 * - Relies on i18n context
 *
 * Outputs:
 * - Renders buyer dashboard UI
 * - Triggers route navigation via router.push() or router.replace()
 */


export default function BuyerDashboard() {
  // Hook for i18n translations
  const { t } = useTranslation();
  // Hook for navigation
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Navigation bar for Buyer role */}
        <NavBuyer />



        {/* Scrollable content of the dashboard */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="cart" size={28} color="#fff" />
            </View>
            <Text style={styles.title}>
              {t("buyer.dashboard_title", "Buyer Dashboard")}
            </Text>
            <Text style={styles.subtitle}>
              {t(
                "buyer.dashboard_sub",
                "Discover crops, compare prices, and bid with confidence"
              )}
            </Text>
          </View>

          {/* Dashboard Feature Grid */}
          <View style={styles.grid}>
            {/* Marketplace */}
            <DashboardTile
              iconBg="#bbdefb"
              iconColor="#1565c0"
              icon="storefront-outline"
              title={t("buyer.marketplace", "Marketplace")}
              sub={t("buyer.marketplace_sub", "Browse available crops from verified farmers")}
              onPress={() => router.push("/marketplace")}
            />

            {/* Live Auctions */}
            <DashboardTile
              iconBg="#ffcdd2"
              iconColor="#c62828"
              icon="hammer-outline"
              title={t("buyer.live_auctions", "Live Auctions")}
              sub={t("buyer.live_auctions_sub", "Participate in real-time crop bidding")}
              onPress={() => router.push("/live-auc-buyer")}
            />

            {/* My Bids */}
            <DashboardTile
              iconBg="#c8e6c9"
              iconColor="#2e7d32"
              icon="trending-up-outline"
              title={t("buyer.my_bids", "My Bids")}
              sub={t("buyer.my_bids_sub", "Track your active and past bids")}
              onPress={() => router.push("/my-bids")}
            />

            {/* Price & Market Insights */}
            <DashboardTile
              iconBg="#e1bee7"
              iconColor="#6a1b9a"
              icon="analytics-outline"
              title={t("buyer.market_insights", "Market Insights")}
              sub={t("buyer.market_insights_sub", "Compare prices and market trends")}
              onPress={() => router.push("/market-insights")}
            />

            {/* Trusted Farmers */}
            <DashboardTile
              iconBg="#ffe0b2"
              iconColor="#e65100"
              icon="shield-checkmark-outline"
              title={t("buyer.trusted_farmers", "Trusted Farmers")}
              sub={t("buyer.trusted_farmers_sub", "Buy from verified farmer profiles")}
              onPress={() => router.push("/browse-crops")}
            />
          </View>
        </ScrollView>

        {/* Voice Navigation (Multimodal Access) */}
        {/* <VoiceNavBtn /> */} {/* Disabled - requires native module build */}
      </View>
    </>
  );
}

/* ---------- Reusable Tile Component ---------- */

/**
 * DashboardTile Component
 *
 * Description:
 * Reusable tile used in BuyerDashboard grid.
 * Displays icon, title, and description with navigation behavior.
 *
 * Props:
 * - iconBg: pastel background color for icon circle
 * - iconColor: icon tint color
 * - icon: Ionicons name
 * - title: tile label
 * - sub: tile description
 * - onPress: navigation handler
 */

function DashboardTile({
  iconBg,
  iconColor,
  icon,
  title,
  sub,
  onPress,
}: {
  iconBg: string;
  iconColor: string;
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
        { backgroundColor: iconBg + "40" },
        pressed && styles.tilePressed,
      ]}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
          backgroundColor: iconBg,
        }}
      >
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSub}>{sub}</Text>
    </Pressable>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e3a8a",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginTop: 4,
    textAlign: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },

  tile: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 16,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  tilePressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  tileTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },

  tileSub: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
});
