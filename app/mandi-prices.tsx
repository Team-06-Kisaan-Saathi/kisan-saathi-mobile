import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchMandiPrices, fetchNearbyMandis, MandiPriceDoc, NearbyMandi } from "../services/mandiService";
import { addToWatchlist, getWatchlist, removeFromWatchlist, WatchlistItem } from "../services/watchlistService";
import * as Location from "expo-location";

export default function MandiPricesScreen() {
  const [prices, setPrices] = useState<MandiPriceDoc[]>([]);
  const [nearby, setNearby] = useState<NearbyMandi[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, w] = await Promise.all([
        fetchMandiPrices({ sort: "latest" }),
        getWatchlist(),
      ]);
      setPrices(p);
      setWatchlist(w);

      // Nearby check
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        const n = await fetchNearbyMandis({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          distKm: 50,
          limit: 5
        });
        setNearby(n);
      }
    } catch (e) {
      setMsg("Failed to load market data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleWatch = async (crop: string, mandi: string) => {
    const existing = watchlist.find(w => w.crop === crop && w.mandi === mandi);
    try {
      if (existing) {
        await removeFromWatchlist(existing._id);
      } else {
        await addToWatchlist(crop, mandi);
      }
      const w = await getWatchlist();
      setWatchlist(w);
    } catch (e) {
      console.error(e);
    }
  };

  const isWatched = (crop: string, mandi: string) => {
    return watchlist.some(w => w.crop === crop && w.mandi === mandi);
  };

  const renderPriceCard = ({ item }: { item: MandiPriceDoc }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cropInfo}>
          <View style={styles.cropIcon}>
            <Text style={styles.cropIconText}>{item.crop.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.cropName}>{item.crop}</Text>
            <Text style={styles.mandiName}>{item.locationName || item.mandi || "Unknown Mandi"}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => toggleWatch(item.crop, item.mandi || item.locationName || "")}>
          <Ionicons
            name={isWatched(item.crop, item.mandi || item.locationName || "") ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isWatched(item.crop, item.mandi || item.locationName || "") ? "#3B82F6" : "#94A3B8"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View>
          <Text style={styles.priceLabel}>Price per Quintal</Text>
          <Text style={styles.priceValue}>₹{item.pricePerQuintal}</Text>
        </View>
        {item.isBestPrice && (
          <View style={styles.bestPriceBadge}>
            <Text style={styles.bestPriceText}>BEST PRICE</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.updateTime}>Updated: {item.date || "Today"}</Text>
        <TouchableOpacity style={styles.compareBtn}>
          <Text style={styles.compareBtnText}>Compare</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Mandi Prices" }} />

      <View style={styles.nearbySection}>
        <Text style={styles.sectionTitle}>Mandis Near You</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={nearby}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.nearbyChip}>
              <Ionicons name="location" size={14} color="#3B82F6" />
              <Text style={styles.nearbyChipText}>{item.name}</Text>
              <Text style={styles.nearbyDist}>{item.distKm.toFixed(1)} km</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No mandis nearby</Text>}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      <FlatList
        data={prices}
        keyExtractor={(item) => item._id}
        renderItem={renderPriceCard}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="stats-chart-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>No prices available yet</Text>
            </View>
          )
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      />

      {msg ? <Text style={styles.errorMsg}>{msg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },
  nearbySection: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#E2E8F0", backgroundColor: "#fff" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#0F172A", marginBottom: 12, marginLeft: 16 },
  nearbyChip: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: "#DBEAFE" },
  nearbyChipText: { fontSize: 13, fontWeight: "600", color: "#1D4ED8", marginHorizontal: 6 },
  nearbyDist: { fontSize: 11, color: "#64748B" },

  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0", elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  cropInfo: { flexDirection: "row", alignItems: "center" },
  cropIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", marginRight: 12 },
  cropIconText: { fontSize: 18, fontWeight: "bold", color: "#334155" },
  cropName: { fontSize: 16, fontWeight: "bold", color: "#0F172A" },
  mandiName: { fontSize: 13, color: "#64748B", marginTop: 2 },

  cardBody: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  priceLabel: { fontSize: 12, color: "#64748B", marginBottom: 4 },
  priceValue: { fontSize: 24, fontWeight: "900", color: "#0F172A" },
  bestPriceBadge: { backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  bestPriceText: { fontSize: 10, fontWeight: "800", color: "#166534" },

  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  updateTime: { fontSize: 12, color: "#94A3B8" },
  compareBtn: { backgroundColor: "#F1F5F9", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  compareBtnText: { fontSize: 13, fontWeight: "600", color: "#334155" },

  errorMsg: { textAlign: "center", color: "#EF4444", padding: 10 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#64748B", marginTop: 12, fontSize: 15 },
});
