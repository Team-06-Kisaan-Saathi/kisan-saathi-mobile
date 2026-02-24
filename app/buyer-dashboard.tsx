import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Stack, useRouter } from "expo-router";
import NavBuyer from "../components/navigation/NavBuyer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart, BarChart } from "react-native-chart-kit";
import { getProfile, getUsers } from "../services/userServices";
import { fetchMandiPrices } from "../services/mandiService";
import { chatService } from "../services/chatService";

const { width } = Dimensions.get("window");

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingCrops, setTrendingCrops] = useState<any[]>([]);
  const [priceTrend, setPriceTrend] = useState<any>(null);
  const [negStats, setNegStats] = useState({ pending: 0, accepted: 0 });

  const loadBuyerData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      // 1. Fetch Profile
      const profileRes = await getProfile();
      if (profileRes?.success) setUser(profileRes.user);

      // 2. Fetch Mandi Trends (Line Chart)
      const mandiRes = await fetchMandiPrices({ crop: "Wheat", limit: 6 });
      if (Array.isArray(mandiRes) && mandiRes.length > 0) {
        setPriceTrend({
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{ data: mandiRes.map(p => p.pricePerQuintal / 100).reverse() }],
        });
        setTrendingCrops(mandiRes.slice(0, 3));
      }

      // 3. Fetch Negotiation Stats (Bar Chart)
      const chatRes = await chatService.getUserChats();
      if (chatRes?.success) {
        setNegStats({ pending: chatRes.chats?.length || 0, accepted: 3 });
      }

    } catch (e) {
      console.log("Error loading buyer dash:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBuyerData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBuyerData();
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(30, 58, 138, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <NavBuyer />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Hello, {user?.name || "Buyer"} 👋</Text>
              <Text style={styles.subtitle}>Discover the best crops & prices today</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/edit-profile")}>
              <Ionicons name="settings-outline" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search Bar - Farmer Discovery */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Farmers or Sellers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => router.push({ pathname: "/buyer-marketplace" as any, params: { q: searchQuery } })}
            />
          </View>

          {/* Marketplace Overview Widget */}
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>840+</Text>
              <Text style={styles.statLab}>Active Listings</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statBox}>
              <View style={styles.cropRow}>
                {trendingCrops.map((c, i) => (
                  <Text key={i} style={styles.cropPill}>{c.crop}</Text>
                ))}
              </View>
              <Text style={styles.statLab}>Trending Now</Text>
            </View>
          </View>

          {/* Chart 1: Price Trends */}
          <SectionLabel title="WHEAT PRICE TREND (₹/KG)" />
          <View style={styles.chartCard}>
            {priceTrend ? (
              <LineChart
                data={priceTrend}
                width={width - 40}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            ) : <ActivityIndicator color="#1e3a8a" />}
          </View>

          {/* Chart 2: Negotiation Status */}
          <SectionLabel title="NEGOTIATIONS SNAPSHOT" />
          <View style={styles.chartCard}>
            <BarChart
              data={{
                labels: ["In Discussion", "Deals Closed"],
                datasets: [{ data: [negStats.pending, negStats.accepted] }],
              }}
              width={width - 40}
              height={180}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              chartConfig={{ ...chartConfig, color: (op) => `rgba(245, 158, 11, ${op})` }}
              style={styles.chart}
            />
          </View>

          {/* Action Grid */}
          <SectionLabel title="EXPLORE" />
          <View style={styles.grid}>
            <ActionCard
              bg="#3b82f6" icon="map-outline"
              title="Mandi Insights" sub="Prices Near You"
              onPress={() => router.push("/market-insights")}
            />
            <ActionCard
              bg="#10b981" icon="cart-outline"
              title="Marketplace" sub="Browse All Crops"
              onPress={() => router.push("/buyer-marketplace")}
            />
            <ActionCard
              bg="#f59e0b" icon="people-outline"
              title="Sellers" sub="Verified Directory"
              onPress={() => router.push("/buyer-marketplace")}
            />
            <ActionCard
              bg="#6366f1" icon="chatbubbles-outline"
              title="Messages" sub="Your Conversations"
              onPress={() => router.push("/chat")}
            />
          </View>

        </ScrollView>
      </View>
    </>
  );
}

// --- COMPONENTS ---

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function ActionCard({ bg, icon, title, sub, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={28} color="#fff" />
      <View style={{ marginTop: 12 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSub}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 60 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  welcomeText: { fontSize: 24, fontWeight: "800", color: "#1e3a8a" },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 12, paddingHorizontal: 12, marginBottom: 20 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 15, color: "#1E293B" },
  statsCard: { flexDirection: "row", backgroundColor: "#1e3a8a", borderRadius: 16, padding: 20, marginBottom: 24 },
  statBox: { flex: 1, alignItems: "center" },
  statVal: { color: "#fff", fontSize: 22, fontWeight: "800" },
  statLab: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 },
  vDivider: { width: 1, height: "100%", backgroundColor: "rgba(255,255,255,0.2)" },
  cropRow: { flexDirection: "row", gap: 6 },
  cropPill: { backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 10, fontWeight: "600" },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: "#94A3B8", letterSpacing: 1, marginBottom: 16, marginTop: 10 },
  chartCard: { backgroundColor: "#fff", borderRadius: 16, padding: 12, marginBottom: 24, borderWidth: 1, borderColor: "#F1F5F9", ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 }, android: { elevation: 2 } }) },
  chart: { marginVertical: 8, borderRadius: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  actionCard: { width: "48%", aspectRatio: 1.1, borderRadius: 20, padding: 16, marginBottom: 16, justifyContent: "space-between" },
  actionTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  actionSub: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 2 },
  schemeWidget: { backgroundColor: "#F8FAFC", borderRadius: 16, padding: 16 },
  widgetTitle: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 12 },
  schemeItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  schemeName: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  schemeSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
});
