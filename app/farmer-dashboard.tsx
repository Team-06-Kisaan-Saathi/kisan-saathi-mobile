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
import { useTheme } from "../hooks/ThemeContext";
import { Stack, useRouter } from "expo-router";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import NavFarmer from "../components/navigation/NavFarmer";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../services/userServices";
import { fetchMandiPrices } from "../services/mandiService";
import { apiFetch } from "../services/http";
import { ENDPOINTS } from "../services/api";
import { cleanLocation } from "../utils/formatters";

const { width } = Dimensions.get("window");

export default function FarmerDashboard() {
  const { highContrast, fontScale } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topPrice, setTopPrice] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState<string>("");

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      const res = await getProfile();
      if (res?.success) {
        setUser(res.user);
      }

      // --- DYNAMIC DATA LOGIC ---
      let cropToLoad = "Wheat";
      let mandiToLoad = res?.user?.location || "Azadpur Mandi";

      try {
        const auctionsRes = await fetch(`${ENDPOINTS.AUCTIONS.GET_ALL}?status=ALL`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (auctionsRes.ok) {
          const allAuctions = await auctionsRes.json();
          const myAuctions = allAuctions.filter((a: any) =>
            String(a.farmerId?._id || a.farmerId) === String(res?.user?._id)
          );
          if (myAuctions.length > 0) {
            cropToLoad = myAuctions[0].crop;
          }
        }
      } catch (e) {
        console.log("Error determining dynamic crop:", e);
      }

      // Load latest price and AI prediction for the main card
      try {
        const query = `?crop=${encodeURIComponent(cropToLoad)}&mandi=${encodeURIComponent(mandiToLoad)}&days=7`;
        const aiRes = await apiFetch<any>(ENDPOINTS.ANALYTICS.FORECAST + query);

        if (aiRes.success) {
          const historical = aiRes.data.historical;
          const predicted = aiRes.data.predicted;

          // Latest price from historical
          const latest = historical[historical.length - 1];
          // Simple trend calculation based on forecast
          const trendDir = predicted[predicted.length - 1].price > latest.price ? "up" : "down";
          const trendPct = ((Math.abs(predicted[predicted.length - 1].price - latest.price) / latest.price) * 100).toFixed(1);

          setTopPrice({
            crop: cropToLoad,
            locationName: mandiToLoad,
            pricePerQuintal: latest.price,
            trend: `${predicted[predicted.length - 1].price > latest.price ? '+' : '-'}${trendPct}% predicted`,
            isUp: trendDir === "up"
          });

          const rec = aiRes.data.recommendation;
          setAiInsight(rec.length > 35 ? rec.substring(0, 35) + "..." : rec);
        } else {
          // Standard fetch if AI fails
          const resPrices = await fetchMandiPrices({ crop: cropToLoad, limit: 1 });
          if (resPrices.data && resPrices.data.length > 0) {
            setTopPrice(resPrices.data[0]);
          }
        }
      } catch (err) {
        console.warn("Dashboard Price Load Error:", err);
      }
    } catch (e) {
      console.log("Dashboard load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, highContrast && { backgroundColor: "#000" }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <NavFarmer />

      <ScrollView
        style={[styles.container, highContrast && { backgroundColor: "#000" }]}
        contentContainerStyle={[styles.scrollContent, highContrast && { backgroundColor: "#000" }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Jai Kisan Header */}
        <View style={[styles.header, highContrast && { backgroundColor: "#000", borderBottomColor: "#333" }]}>
          <Text style={[styles.welcomeText, highContrast && { color: "#FFF" }]} numberOfLines={1}>{t("dashboard.jai_kisan")}, {user?.name || t("profile.user") || "Farmer"} </Text>
          <Text style={[styles.subtext, highContrast && { color: "#CCC" }]}>{t("dashboard.farmer_sub")}</Text>
        </View>

        {/* TODAY'S TOP PRICE */}
        <SectionHeader title={t("dashboard.top_price") || "TODAY'S TOP PRICE"} />
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
              style={styles.sellNowBtn}
              onPress={() => router.push("/create-auction")}
            >
              <Text style={styles.sellNowText}>{t("dashboard.sell_now") || "Sell Now"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MARKET INFO */}
        <SectionHeader title={t("dashboard.market_info") || "MARKET INFO"} />
        <View style={styles.grid}>
          <View style={[styles.row, highContrast && { borderBottomColor: "#333" }]}>
            <MarketCard
              title={t("nav_farmer.mandi_prices") || "Mandi Prices"}
              subtitle={t("dashboard.live_rates_near_you") || "Live rates near you"}
              icon="stats-chart"
              color="#2563EB"
              onPress={() => router.push("/mandi-prices")}
            />
            <MarketCard
              title={t("nav_farmer.ai_insights") || "AI Insights"}
              subtitle={aiInsight || t("dashboard.smart_crop_advice")}
              icon="bulb"
              color="#EA580C"
              onPress={() => router.push("/ai-insights")}
            />
          </View>
          <View style={[styles.row, highContrast && { borderBottomColor: "#333" }]}>
            <MarketCard
              title={t("dashboard.weather") || "Weather"}
              subtitle={t("dashboard.forecast") || "7-day forecast"}
              icon="cloudy-night"
              color="#0EA5E9"
              onPress={() => router.push("/weather" as any)}
            />
            <MarketCard
              title={t("dashboard.govt_schemes") || "Govt Schemes"}
              subtitle={t("dashboard.subsidies_loans") || "Subsidies & loans"}
              icon="ribbon"
              color="#7C3AED"
              onPress={() => router.push("/govt-schemes")}
            />
          </View>
        </View>

        {/* BUY & SELL */}
        <SectionHeader title={t("dashboard.buy_sell") || "BUY & SELL"} />
        <View style={styles.grid}>
          <View style={[styles.row, highContrast && { borderBottomColor: "#333" }]}>
            <BuySellCard
              title={t("farmer.marketplace") || "Marketplace"}
              subtitle={t("dashboard.buy_inputs") || "Buy inputs & tools"}
              icon="briefcase"
              color="#16A34A"
              onPress={() => router.push("/marketplace")}
            />
            <BuySellCard
              title={t("farmer.live_auctions") || "Live Auctions"}
              subtitle={t("dashboard.host_auction") || "Host an auction"}
              icon="flash"
              color="#DC2626"
              onPress={() => router.push("/create-auction")}
            />
          </View>
          <View style={[styles.row, highContrast && { borderBottomColor: "#333" }]}>
            <BuySellCard
              title={t("farmer.my_listings") || "My Listings"}
              subtitle={t("dashboard.manage_crops") || "Manage your crops"}
              icon="list"
              color="#111827"
              onPress={() => router.push("/my-listings")}
            />
            <BuySellCard
              title={t("dashboard.monitor_auctions") || "Monitor Auctions"}
              subtitle={t("dashboard.view_bids_status") || "View bids & status"}
              icon="stats-chart"
              color="#10B981"
              onPress={() => router.push("/farmer-auctions")}
            />
          </View>
        </View>

        {/* HELP & SUPPORT */}
        <SectionHeader title={t("dashboard.help_support") || "HELP & SUPPORT"} />
        <View style={styles.supportList}>
          <SupportItem
            title={t("farmer.messages") || "Messages"}
            subtitle={t("dashboard.chat_buyers") || "Chat with buyers"}
            icon="chatbubble-ellipses"
            color="#3B82F6"
            onPress={() => router.push("/messages")}
          />

          <SupportItem
            title={t("dashboard.call_support") || "Call Support"}
            subtitle={t("dashboard.talk_expert") || "Talk to an expert"}
            icon="call"
            color="#F59E0B"
            onPress={() => router.push("/call-support")}
          />
          <SupportItem
            title={t("dashboard.settings") || "Settings"}
            subtitle={t("dashboard.account_prefs") || "Account & preferences"}
            icon="settings"
            color="#64748B"
            onPress={() => router.push("/settings")}
          />
          <SupportItem
            title={t("dashboard.help_center") || "Help Center"}
            subtitle={t("dashboard.faqs_guides") || "FAQs & guides"}
            icon="help-circle"
            color="#A855F7"
            onPress={() => Alert.alert(t("dashboard.help_center") || "Help Center", "Redirecting to help portal...")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { highContrast } = useTheme();
  return <Text style={[styles.sectionTitle, highContrast && { color: "#FFF" }]}>{title}</Text>;
}

function MarketCard({ title, subtitle, icon, color, onPress }: any) {
  const { highContrast } = useTheme();
  return (
    <TouchableOpacity style={[styles.marketCard, { backgroundColor: color }, highContrast && { backgroundColor: "#222", borderColor: color, borderWidth: 2 }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#FFF" />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={2}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function BuySellCard({ title, subtitle, icon, color, onPress }: any) {
  const { highContrast } = useTheme();
  return (
    <TouchableOpacity style={[styles.buySellCard, { backgroundColor: color }, highContrast && { backgroundColor: "#222", borderColor: color, borderWidth: 2 }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#FFF" />
      <View style={{ marginTop: 12 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function SupportItem({ title, subtitle, icon, color, onPress }: any) {
  const { highContrast } = useTheme();
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
  welcomeText: { fontSize: 26, fontWeight: "900", color: "#0F172A" },
  subtext: { fontSize: 16, color: "#64748B", marginTop: 4, fontWeight: "500" },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94A3B8",
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  topPriceCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 4, // More square as in image
    borderTopWidth: 6,
    borderTopColor: "#16A34A",
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4
  },
  priceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cropName: { fontSize: 28, fontWeight: "900", color: "#0F172A" },
  mandiRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  mandiName: { fontSize: 15, color: "#64748B", marginLeft: 4, fontWeight: "600" },
  unitText: { fontSize: 14, color: "#94A3B8", marginTop: 4, fontWeight: "500" },
  priceVal: { fontSize: 32, fontWeight: "900", color: "#0F172A" },
  trendRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  trendText: { fontSize: 14, color: "#22C55E", fontWeight: "700", marginLeft: 4 },

  priceActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  seeAllBtn: {
    flex: 1.5,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 4
  },
  seeAllText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  sellNowBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 4
  },
  sellNowText: { color: "#0F172A", fontWeight: "800", fontSize: 15 },

  grid: { paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  row: { flexDirection: "row", gap: 12 },

  marketCard: { flex: 1, padding: 20, borderRadius: 0, justifyContent: "center", minHeight: 120 },
  cardTitle: { color: "#FFF", fontSize: 18, fontWeight: "900", marginTop: 12 },
  cardSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600", marginTop: 2 },

  buySellCard: { flex: 1, padding: 20, borderRadius: 0, minHeight: 120 },

  supportList: { marginHorizontal: 20, backgroundColor: "#FFF", borderRadius: 12, overflow: "hidden", marginBottom: 40, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  supportIcon: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  supportTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B" },
  supportSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2, fontWeight: "500" },
});