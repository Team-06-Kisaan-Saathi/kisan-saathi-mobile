import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  Animated,
  Pressable,
} from "react-native";
import LottieView from "lottie-react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import NavBuyer from "../components/navigation/NavBuyer";
import { useTheme } from "../hooks/ThemeContext";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../services/userServices";
import { fetchMandiPrices } from "../services/mandiService";
import { apiFetch } from "../services/http";
import { ENDPOINTS } from "../services/api";
import { cleanLocation } from "../utils/formatters";

const { width } = Dimensions.get("window");

export default function BuyerDashboard() {
  const { highContrast } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topPrice, setTopPrice] = useState<any>(null);
  const [bidStats, setBidStats] = useState({ active: 0, leading: 0, won: 0 });

  const loadData = async () => {
    try {
      // 1. Try to load cached user first for instant UI
      const cachedUser = await AsyncStorage.getItem("profile");
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      const res = await getProfile();
      if (res?.success) {
        // --- RACE CONDITION PROTECTION ---
        // If we just updated the profile in the last 10 seconds, ignore the server's data
        // because it might still be propagating (stale cache).
        const lastUpdate = await AsyncStorage.getItem("profile_updated_at");
        const now = Date.now();
        const isFresh = lastUpdate && (now - parseInt(lastUpdate)) < 10000;

        if (!isFresh) {
          setUser(res.user);
          await AsyncStorage.setItem("profile", JSON.stringify(res.user));
          if (res.user.name) {
            await AsyncStorage.setItem("userName", res.user.name);
          }
        }
      }

      // --- DYNAMIC DATA LOGIC ---
      let cropToLoad = "Wheat";
      let mandiToLoad = res?.user?.location || "Azadpur Mandi";

      try {
        const bidRes = await fetch(ENDPOINTS.AUCTIONS.MY_BIDS, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (bidRes.ok) {
          const myAuctionsWithBids = await bidRes.json();
          if (myAuctionsWithBids.length > 0) {
            cropToLoad = myAuctionsWithBids[0].crop;
          }
        }
      } catch (e) {
        console.log("Error determining dynamic crop for buyer:", e);
      }

      // Load latest price and AI prediction for the main card
      try {
        const query = `?crop=${encodeURIComponent(cropToLoad)}&mandi=${encodeURIComponent(mandiToLoad)}&days=7`;
        const aiRes = await apiFetch<any>(ENDPOINTS.ANALYTICS.FORECAST + query);

        if (aiRes.success) {
          const historical = aiRes.data.historical;
          const predicted = aiRes.data.predicted;

          const latest = historical[historical.length - 1];
          const trendDir = predicted[predicted.length - 1].price > latest.price ? "up" : "down";
          const trendPct = ((Math.abs(predicted[predicted.length - 1].price - latest.price) / latest.price) * 100).toFixed(1);

          setTopPrice({
            crop: cropToLoad,
            locationName: mandiToLoad,
            pricePerQuintal: latest.price,
            trend: `${predicted[predicted.length - 1].price > latest.price ? '+' : '-'}${trendPct}% predicted`,
            isUp: trendDir === "up"
          });
        } else {
          const resPrices = await fetchMandiPrices({ crop: cropToLoad, limit: 1 });
          if (resPrices.data && resPrices.data.length > 0) {
            setTopPrice(resPrices.data[0]);
          }
        }
      } catch (err) {
        console.warn("Dashboard Price Load Error:", err);
      }

      // Fetch bid stats
      try {
        const bidRes = await fetch(ENDPOINTS.AUCTIONS.MY_BIDS, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (bidRes.ok) {
          const myAuctions = await bidRes.json();
          const profileData = res?.user || user;
          let active = 0, leading = 0, won = 0;
          myAuctions.forEach((a: any) => {
            if (a.status === "OPEN") {
              active++;
              const highest = a.bids?.length > 0 ? Math.max(...a.bids.map((b: any) => b.amount)) : 0;
              const myBest = a.bids?.filter((b: any) => String(b.buyerId?._id || b.buyerId) === String(profileData?._id))
                .sort((x: any, y: any) => y.amount - x.amount)[0];
              if (myBest && myBest.amount === highest) leading++;
            } else if (a.status === "CLOSED" && a.winningBid && String(a.winningBid.buyerId) === String(profileData?._id)) {
              won++;
            }
          });
          setBidStats({ active, leading, won });
        }
      } catch (e) { console.log("Bid stats error:", e); }
    } catch (e) {
      console.log("Dashboard load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, highContrast && { backgroundColor: "#000" }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <NavBuyer />
      <ScrollView
        style={[styles.container, highContrast && { backgroundColor: "#000" }]}
        contentContainerStyle={[styles.scrollContent, highContrast && { backgroundColor: "#000" }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Header */}
        <View style={[styles.header, highContrast && { backgroundColor: "#000", borderBottomColor: "#333" }]}>
          <Text style={[styles.welcomeText, highContrast && { color: "#FFF" }]} numberOfLines={1}>{t("dashboard.welcome") || "Welcome"}, {user?.name || t("profile.user") || "Buyer"} </Text>
          <Text style={[styles.subtext, highContrast && { color: "#CCC" }]}>{t("dashboard.buyer_sub") || "Find the best deals & place your bids"}</Text>
        </View>

        {/* BID ACTIVITY */}
        {bidStats.active > 0 && (
          <>
            <SectionHeader title={t("dashboard.bid_activity") || "BID ACTIVITY"} highContrast={highContrast} />
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderLeftColor: '#2563EB' }, highContrast && { backgroundColor: "#111", borderTopColor: "#333", borderRightColor: "#333", borderBottomColor: "#333", borderWidth: 1 }]}>
                <Text style={styles.statNum}>{bidStats.active}</Text>
                <Text style={[styles.statLab, highContrast && { color: "#CCC" }]}>{t("dashboard.active_bids") || "Active Bids"}</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#10B981' }, highContrast && { backgroundColor: "#111", borderTopColor: "#333", borderRightColor: "#333", borderBottomColor: "#333", borderWidth: 1 }]}>
                <Text style={[styles.statNum, { color: '#10B981' }]}>{bidStats.leading}</Text>
                <Text style={[styles.statLab, highContrast && { color: "#CCC" }]}>{t("dashboard.leading") || "Leading"}</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#D97706' }, highContrast && { backgroundColor: "#111", borderTopColor: "#333", borderRightColor: "#333", borderBottomColor: "#333", borderWidth: 1 }]}>
                <Text style={[styles.statNum, { color: '#D97706' }]}>{bidStats.won}</Text>
                <Text style={[styles.statLab, highContrast && { color: "#CCC" }]}>{t("dashboard.won") || "Won"}</Text>
              </View>
            </View>
          </>
        )}

        {/* TODAY'S TOP PRICE */}
        <SectionHeader title={t("dashboard.top_price") || "TODAY'S TOP PRICE"} highContrast={highContrast} />
        <View style={[styles.topPriceCard, highContrast && { backgroundColor: "#111", borderColor: "#FFF", borderWidth: 1 }]}>
          <View style={styles.priceHeader}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.cropName, highContrast && { color: "#FFF" }]} numberOfLines={1}>{topPrice?.crop || t("dashboard.wheat") || "Wheat"}</Text>
              <View style={styles.mandiRow}>
                <Ionicons name="location-sharp" size={14} color="#94A3B8" />
                <Text style={[styles.mandiName, highContrast && { color: "#CCC" }]} numberOfLines={1}>{cleanLocation(topPrice?.locationName || topPrice?.mandi || t("dashboard.azadpur") || "Azadpur Mandi")}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={[styles.priceVal, highContrast && { color: "#FFF" }]}>₹{topPrice?.pricePerQuintal?.toLocaleString() || "2,340"}</Text>
                <Text style={[styles.unitText, highContrast && { color: "#CCC" }, { marginLeft: 4, marginTop: 0 }]}>{t("dashboard.per_quintal") || "/ quintal"}</Text>
              </View>
              <View style={styles.trendRow}>
                <MaterialCommunityIcons
                  name={topPrice?.isUp !== false ? "trending-up" : "trending-down"}
                  size={16}
                  color={topPrice?.isUp !== false ? "#22C55E" : "#EF4444"}
                />
                <Text style={[styles.trendText, topPrice?.isUp === false && { color: '#EF4444' }]}>
                  {topPrice?.trend || t("dashboard.this_week_trend") || "+4.2% this week"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.priceActions}>
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => router.push("/mandi-prices")}
            >
              <Ionicons name="bar-chart" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.seeAllText}>{t("dashboard.see_all_prices") || "See All Prices"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={() => router.push("/buyer-auctions" as any)}
            >
              <Text style={styles.buyNowText}>{t("dashboard.browse_auctions") || "Browse Auctions"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BUY & BID */}
        <SectionHeader title={t("dashboard.buy_bid") || "BUY & BID"} highContrast={highContrast} />
        <View style={styles.grid}>
          <View style={[styles.row, highContrast && { borderBottomColor: "#333" }]}>
            <BuySellCard
              title={t("farmer.live_auctions") || "Live Auctions"}
              subtitle={t("dashboard.browse_bid_crops") || "Browse & bid on crops"}
              icon="flash"
              color="#FB923C"
              highContrast={highContrast}
              onPress={() => router.push("/buyer-auctions" as any)}
            />
            <BuySellCard
              title={t("dashboard.my_bids") || "My Bids"}
              subtitle={t("dashboard.track_bids") || "Track your bids"}
              icon="list"
              color="#FBBF24"
              highContrast={highContrast}
              onPress={() => router.push("/my-bids" as any)}
            />
          </View>
          <View style={[styles.row, highContrast && { borderBottomColor: "#333" }]}>
            <BuySellCard
              title={t("dashboard.sellers") || "Sellers"}
              subtitle={t("dashboard.verified_directory") || "Verified Directory"}
              icon="people"
              color="#94A3B8"
              highContrast={highContrast}
              onPress={() => router.push("/buyer-marketplace")}
            />
            <BuySellCard
              title={t("dashboard.deals") || "Deals"}
              subtitle={t("dashboard.your_negotiations") || "Your negotiations"}
              icon="handshake-outline"
              iconFamily="MaterialCommunityIcons"
              color="#A3A3A3"
              highContrast={highContrast}
              onPress={() => router.push("/not-available")}
            />
          </View>
        </View>

        {/* HELP & SUPPORT */}
        <SectionHeader title={t("dashboard.help_support") || "HELP & SUPPORT"} highContrast={highContrast} />
        <View style={styles.supportList}>
          <SupportItem
            title={t("farmer.messages") || "Messages"}
            subtitle={t("dashboard.chat_farmers") || "Chat with farmers"}
            icon="chatbubble-ellipses"
            color="#3B82F6"
            highContrast={highContrast}
            onPress={() => router.push("/messages")}
          />
          <SupportItem
            title={t("dashboard.call_support") || "Call Support"}
            subtitle={t("dashboard.talk_expert") || "Talk to an expert"}
            icon="call"
            color="#F59E0B"
            highContrast={highContrast}
            onPress={() => router.push("/call-support")}
          />
          <SupportItem
            title={t("dashboard.settings") || "Settings"}
            subtitle={t("dashboard.account_prefs") || "Account & preferences"}
            icon="settings"
            color="#64748B"
            highContrast={highContrast}
            onPress={() => router.push("/settings")}
          />
          <SupportItem
            title={t("dashboard.help_center") || "Help Center"}
            subtitle={t("dashboard.faqs_guides") || "FAQs & guides"}
            icon="help-circle"
            color="#A855F7"
            highContrast={highContrast}
            onPress={() => Alert.alert(t("dashboard.help_center") || "Help Center", "Redirecting to help portal...")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, highContrast }: { title: string; highContrast: boolean }) {
  return <Text style={[styles.sectionTitle, highContrast && { color: "#FFF" }]}>{title}</Text>;
}

function MarketCard({ title, subtitle, icon, color, onPress, highContrast }: any) {
  return (
    <TouchableOpacity style={[styles.marketCard, { backgroundColor: color }, highContrast && { backgroundColor: "#222", borderColor: color, borderWidth: 2 }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#FFF" />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={2}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function BuySellCard({ title, subtitle, icon, color, onPress, iconFamily, highContrast }: any) {
  return (
    <TouchableOpacity style={[styles.buySellCard, { backgroundColor: color }, highContrast && { backgroundColor: "#222", borderColor: color, borderWidth: 2 }]} onPress={onPress}>
      {iconFamily === "MaterialCommunityIcons" ? (
        <MaterialCommunityIcons name={icon} size={24} color="#FFF" />
      ) : (
        <Ionicons name={icon} size={24} color="#FFF" />
      )}
      <View style={{ marginTop: 12 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function SupportItem({ title, subtitle, icon, color, onPress, highContrast }: any) {
  return (
    <TouchableOpacity style={[styles.supportItem, highContrast && { backgroundColor: "#111", borderBottomColor: "#333" }]} onPress={onPress}>
      <View style={[styles.supportIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={[styles.supportTitle, highContrast && { color: "#FFF" }]}>{title}</Text>
        <Text style={[styles.supportSubtitle, highContrast && { color: "#CCC" }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingBottom: 100 },

  header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  welcomeText: { color: "#0F172A" }, // Dark Navy Blue close to black
  subtext: { fontSize: 16, color: "#64748B", marginTop: 4, fontWeight: "500" },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1.5,
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 12
  },

  topPriceCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8
  },
  priceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cropName: { fontSize: 22, fontWeight: "900", color: "#0F172A" },
  mandiRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  mandiName: { fontSize: 13, color: "#64748B", marginLeft: 4, fontWeight: "600" },
  unitText: { fontSize: 14, color: "#94A3B8", marginTop: 4, fontWeight: "500" },
  priceVal: { fontSize: 24, fontWeight: "900", color: "#0F172A" },
  trendRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  trendText: { fontSize: 14, color: "#22C55E", fontWeight: "700", marginLeft: 4 },

  priceActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  seeAllBtn: {
    flex: 1.5,
    backgroundColor: "#1E3A8A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12
  },
  seeAllText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  buyNowBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12
  },
  buyNowText: { color: "#2563EB", fontWeight: "800", fontSize: 15 },

  grid: { paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  row: { flexDirection: "row", gap: 12 },

  marketCard: { flex: 1, padding: 20, borderRadius: 16, justifyContent: "center", minHeight: 120 },
  cardTitle: { color: "#FFF", fontSize: 18, fontWeight: "900", marginTop: 12 },
  cardSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600", marginTop: 2 },

  buySellCard: { flex: 1, padding: 20, borderRadius: 16, minHeight: 120 },

  supportList: { marginHorizontal: 20, backgroundColor: "#FFF", borderRadius: 12, overflow: "hidden", marginBottom: 40, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC"
  },
  supportIcon: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  supportTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B" },
  supportSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2, fontWeight: "500" },

  statsRow: { flexDirection: "row", gap: 10, marginHorizontal: 20, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statNum: { fontSize: 24, fontWeight: "900", color: "#2563EB" },
  statLab: { fontSize: 11, fontWeight: "600", color: "#64748B", marginTop: 2 },
});
