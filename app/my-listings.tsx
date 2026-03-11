import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Dimensions,
  SafeAreaView
} from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavAuto from "../components/navigation/NavAuto";
import { ENDPOINTS } from "../services/api";
import { getProfile } from "../services/userServices";
import { Ionicons, Feather } from "@expo/vector-icons";
import { chatService } from "../services/chatService";
import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const formatCurr = (val: number) => `₹${val.toLocaleString("en-IN")}`;

// Timer Component
const ListingTimer = ({ createdAt, status }: { createdAt: string, status: string }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isEnded, setIsEnded] = useState(status === "CLOSED");
  const { t } = useTranslation();

  useEffect(() => {
    if (status === "CLOSED") {
      setIsEnded(true);
      setTimeLeft(t("list.ended") || "Ended");
      return;
    }

    const addedMillis = 24 * 60 * 60 * 1000;
    const endTime = new Date(createdAt).getTime() + addedMillis;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = endTime - now;

      if (diff <= 0) {
        setIsEnded(true);
        setTimeLeft("0s");
        return;
      }

      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      let timeStr = "";
      if (h > 0) timeStr += `${h}h `;
      if (m > 0 || h > 0) timeStr += `${m}m`;

      setTimeLeft(timeStr.trim());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // update every minute
    return () => clearInterval(interval);
  }, [createdAt, status, t]);

  if (status === "CLOSED") {
    return <Text style={styles.timeValueEnded}>{timeLeft}</Text>;
  }

  return (
    <Text style={[styles.timeValue, isEnded ? { color: '#EF4444' } : null]}>
      {timeLeft}
    </Text>
  );
};

export default function MyListingsScreen() {
  const { highContrast } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"All" | "Active" | "Ended" | "Sold">("All");
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadAuctions();
    }, [])
  );

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const profileRes = await getProfile();
      let currentUser = profileRes?.user;
      if (currentUser) setUser(currentUser);

      const res = await fetch(`${ENDPOINTS.AUCTIONS.GET_ALL}?status=ALL`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch auctions");
      const allAuctions = await res.json();

      // Filter for only this farmer's auctions
      const myAuctions = allAuctions.filter((a: any) => {
        const fid = a.farmerId?._id || a.farmerId;
        return String(fid) === String(currentUser?._id);
      });

      // Map backend data to UI format
      const formatted = myAuctions.map((a: any) => {
        let maxBid = 0;
        let todayBidsCount = 0;

        if (a.bids && a.bids.length > 0) {
          maxBid = Math.max(...a.bids.map((b: any) => b.amount));

          // Count bids placed today
          const today = new Date().toDateString();
          todayBidsCount = a.bids.filter((b: any) => new Date(b.time).toDateString() === today).length;
        }

        // Calculate remaining time for "Ending Soon" check
        const addedMillis = 24 * 60 * 60 * 1000;
        const endTime = new Date(a.createdAt).getTime() + addedMillis;
        const diff = endTime - new Date().getTime();
        const hoursLeft = diff / (1000 * 60 * 60);
        const endingSoon = a.status === "OPEN" && hoursLeft > 0 && hoursLeft < 1;

        return {
          id: a._id,
          crop: a.crop,
          variety: a.variety || "Standard",
          createdAt: a.createdAt,
          quantity: `${a.quantityKg} kg`,
          basePrice: a.basePrice,
          currentHighBid: maxBid,
          totalBids: a.bids ? a.bids.length : 0,
          todayBidsCount,
          status: a.status,
          endingSoon,
          timeDiff: diff,
          winnerName: a.winningBid?.buyerId?.name || null,
          winnerId: a.winningBid?.buyerId?._id || a.winningBid?.buyerId || null,
          winningAmount: a.winningBid?.amount || 0,
        };
      });

      // Sort with 'ending soon' & newest first
      formatted.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setAuctions(formatted);
    } catch (e) {
      console.log("Error fetching my auctions", e);
      Alert.alert("Error", t("list.error_load") || "Could not load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleEndAuction = async (auction: any) => {
    const doClose = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(ENDPOINTS.AUCTIONS.CLOSE(auction.id), {
          method: 'POST',
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          await loadAuctions();
          if (Platform.OS === 'web') window.alert(t("list.auction_ended") || "Auction ended!");
          else Alert.alert(t("common.success") || "Success", t("list.auction_ended") || "Auction ended.");
        } else {
          if (Platform.OS === 'web') window.alert(t("list.failed_end") || "Failed to end auction.");
          else Alert.alert(t("common.error") || "Error", t("list.failed_end") || "Failed to end auction.");
        }
      } catch (e) {
        console.log("Error ending auction:", e);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t("list.confirm_end", { crop: auction.crop }) || `Are you sure you want to end the auction for ${auction.crop}?`)) doClose();
    } else {
      Alert.alert(t("list.end_auction_q") || "End Auction?", t("list.confirm_end", { crop: auction.crop }) || `Are you sure you want to end the auction for ${auction.crop}?`, [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        { text: t("list.end_auction_btn") || "End Auction", style: "destructive", onPress: doClose }
      ]);
    }
  };

  // Dashboard Stats
  const activeCount = auctions.filter(a => a.status === "OPEN").length;
  const endingSoonCount = auctions.filter(a => a.endingSoon).length;
  const totalBidsToday = auctions.reduce((sum, a) => sum + a.todayBidsCount, 0);
  const wonCount = auctions.filter(a => a.status === "CLOSED" && a.winningAmount > 0).length;

  const stats = {
    active: activeCount,
    endingSoon: endingSoonCount,
    bidsReceived: totalBidsToday,
    sold: wonCount,
  };

  const filteredAuctions = auctions.filter(a => {
    if (filter === "All") return true;
    if (filter === "Active") return a.status === "OPEN";
    if (filter === "Ended") return a.status === "CLOSED";
    if (filter === "Sold") return a.status === "CLOSED" && a.winningAmount > 0;
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, highContrast && { backgroundColor: "#000" }]}>
      <Stack.Screen options={{
        title: t("list.title") || "My Listings",
        headerShadowVisible: false,
        headerShown: false,
      }} />
      <NavAuto />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Actions */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.pageTitle, highContrast && { color: "#FFF" }]}>{t("list.title") || "My Listings"}</Text>
            <Text style={[styles.pageSubtitle, highContrast && { color: "#AAA" }]}>{t("list.sub") || "Manage your crop auctions"}</Text>
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={() => router.push("/create-auction")}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createBtnText}>{t("list.create") || "Create Auction"}</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Summary */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: '#EFF6FF' }]}>
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel}>{t("list.active") || "Active\nAuctions"}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.endingSoon}</Text>
            <Text style={styles.statLabel}>{t("list.ending") || "Ending\nSoon"}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.bidsReceived}</Text>
            <Text style={styles.statLabel}>{t("list.bids_today") || "Bids\nToday"}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#F8FAFC' }]}>
            <Text style={[styles.statNumber, { color: '#64748B' }]}>{stats.sold}</Text>
            <Text style={styles.statLabel}>{t("list.won_sold") || "Auctions\nWon/Sold"}</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filterContainer}>
          {["All", "Active", "Ended", "Sold"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f as any)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{t(`list.filter_${f.toLowerCase()}`) || f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Listings */}
        <View style={styles.listingsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
          ) : filteredAuctions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>{t("list.no_listings") || "You have no listings yet"}</Text>
              <TouchableOpacity style={styles.createEmptyBtn} onPress={() => router.push("/create-auction")}>
                <Text style={styles.createEmptyBtnText}>{t("list.create") || "Create Auction"}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredAuctions.map((auction) => {
              const isActive = auction.status === "OPEN";
              const isSold = auction.status === "CLOSED" && auction.winningAmount > 0;
              const hasBids = auction.totalBids > 0;
              const isEndingSoon = auction.endingSoon;

              return (
                <View key={auction.id} style={styles.card}>
                  {/* Ending Soon Warning */}
                  {isEndingSoon && isActive && (
                    <View style={styles.warningBanner}>
                      <Ionicons name="warning" size={14} color="#B45309" />
                      <Text style={styles.warningText}>{t("list.warn") || "Ending Soon (Less than 1 hr)"}</Text>
                    </View>
                  )}

                  <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.cropTitle}>{auction.crop} ({auction.variety})</Text>
                        <Text style={styles.cropSubtitle}>{auction.quantity}</Text>
                      </View>
                      <View style={[styles.statusBadge, isActive ? styles.statusLive : (isSold ? styles.statusSold : styles.statusEnded)]}>
                        <Text style={[styles.statusText, isActive ? styles.statusTextLive : (isSold ? styles.statusTextSold : styles.statusTextEnded)]}>
                          {isActive ? (t("list.badge_live") || "LIVE") : (isSold ? (t("list.badge_sold") || "SOLD") : (t("list.badge_end") || "ENDED"))}
                        </Text>
                      </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.gridRow}>
                      <View style={styles.gridCol}>
                        <Text style={styles.gridLabel}>{t("list.base_price") || "Base Price"}</Text>
                        <Text style={styles.gridValue}>{formatCurr(auction.basePrice)}</Text>
                      </View>
                      <View style={styles.gridCol}>
                        <Text style={styles.gridLabel}>{t("list.time_left") || "Time Left"}</Text>
                        <ListingTimer createdAt={auction.createdAt} status={auction.status} />
                      </View>
                    </View>
                    <View style={[styles.gridRow, { marginTop: 12 }]}>
                      <View style={styles.gridCol}>
                        <Text style={styles.gridLabel}>{t("list.highest_bid") || "Highest Bid"}</Text>
                        <Text style={[styles.gridValue, hasBids ? styles.highlightValue : null]}>
                          {hasBids ? formatCurr(auction.currentHighBid) : "₹0"}
                        </Text>
                      </View>
                      <View style={styles.gridCol}>
                        <Text style={styles.gridLabel}>{t("list.total_bids") || "Total Bids"}</Text>
                        <Text style={styles.gridValue}>{auction.totalBids}</Text>
                      </View>
                    </View>

                    {/* Winner Info if Sold */}
                    {isSold && (
                      <View style={styles.winnerSection}>
                        <Text style={styles.winnerLabel}>{t("list.winning_bid") || "Winning Bid"}: <Text style={styles.winnerAmount}>{formatCurr(auction.winningAmount)}</Text></Text>
                        <Text style={styles.winnerLabel}>{t("list.winner") || "Winner"}: <Text style={styles.winnerName}>{auction.winnerName}</Text></Text>
                      </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                      {isActive ? (
                        <>
                          <TouchableOpacity
                            style={styles.actionBtnPrimary}
                            onPress={() => router.push("/farmer-auctions")}
                          >
                            <Text style={styles.actionBtnPrimaryText}>{t("list.monitor_auction") || "Monitor Auction"}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionBtnSecondary}
                            onPress={() => handleEndAuction(auction)}
                          >
                            <Text style={styles.actionBtnSecondaryText}>{t("list.end_auction_btn") || "End Auction"}</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          {isSold && (
                            <TouchableOpacity
                              style={[styles.actionBtnPrimary, { backgroundColor: "#D97706" }]}
                              onPress={async () => {
                                try {
                                  const res = await chatService.getOrCreateChat(auction.winnerId, auction.id);
                                  if (res?.success) {
                                    router.push(`/chat/${res.chat._id}?dealId=${auction.id}`);
                                  } else {
                                    Alert.alert(t("common.error") || "Error", t("list.chat_error") || "Could not start chat.");
                                  }
                                } catch (err) {
                                  console.log("Chat init error", err);
                                  Alert.alert(t("common.error") || "Error", t("list.chat_error") || "Could not start chat.");
                                }
                              }}
                            >
                              <Ionicons name="chatbubble-ellipses" size={16} color="#FFF" style={{ marginRight: 6 }} />
                              <Text style={styles.actionBtnPrimaryText}>{t("list.message_buyer") || "Message Buyer"}</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={styles.actionBtnSecondaryNeutral}
                            onPress={() => router.push("/farmer-auctions")}
                          >
                            <Text style={styles.actionBtnSecondaryNeutralText}>{t("list.view_result") || "View Result"}</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { paddingBottom: 40 },
  header: { padding: 20, paddingTop: 10, paddingBottom: 16, backgroundColor: "#FFF" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  pageSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  statsContainer: { flexDirection: "row", backgroundColor: "#FFF", padding: 16 },
  statBox: { flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 10, marginHorizontal: 4 },
  statNumber: { fontSize: 20, fontWeight: "800", color: "#111827" },
  statLabel: { fontSize: 11, fontWeight: "600", color: "#4B5563", marginTop: 4 },
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", marginTop: 16 },
  createEmptyBtn: { backgroundColor: "#10B981", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24 },
  createEmptyBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  // Dashboard
  dashboardContainer: { padding: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB", marginBottom: 16 },
  dashRow: { flexDirection: "row", gap: 8, justifyContent: "space-between" },
  dashBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  dashLabel: { fontSize: 11, fontWeight: "600", color: "#4B5563", textAlign: "center", marginBottom: 4 },
  dashValue: { fontSize: 20, fontWeight: "800" },

  // Filters
  filtersScroll: { maxHeight: 50, marginBottom: 16 },
  filterContainer: { paddingHorizontal: 16, gap: 10, flexDirection: "row", alignItems: "center" },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#D1D5DB" },
  filterBtnActive: { backgroundColor: "#111827", borderColor: "#111827" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#4B5563" },
  filterTextActive: { color: "#FFF" },

  // Listings
  listingsContainer: { paddingHorizontal: 16, gap: 16 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: "#6B7280", marginTop: 16, marginBottom: 24, fontWeight: "500" },
  createBtn: { backgroundColor: "#10B981", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  createBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  // Card
  card: { backgroundColor: "#FFF", borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  warningBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF3C7", paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  warningText: { fontSize: 12, fontWeight: "700", color: "#92400E" },
  cardBody: { padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  cropTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  cropSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 2, fontWeight: "500" },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusLive: { backgroundColor: "#ECFDF5", borderColor: "#34D399" },
  statusEnded: { backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" },
  statusSold: { backgroundColor: "#EFF6FF", borderColor: "#93C5FD" },
  statusText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  statusTextLive: { color: "#059669" },
  statusTextEnded: { color: "#6B7280" },
  statusTextSold: { color: "#2563EB" },

  gridRow: { flexDirection: "row", justifyContent: "space-between" },
  gridCol: { flex: 1 },
  gridLabel: { fontSize: 11, color: "#6B7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  gridValue: { fontSize: 16, fontWeight: "700", color: "#374151" },
  highlightValue: { color: "#10B981" },
  timeValue: { fontSize: 16, fontWeight: "700", color: "#111827" },
  timeValueEnded: { fontSize: 16, fontWeight: "700", color: "#6B7280" },

  winnerSection: { marginTop: 16, padding: 12, backgroundColor: "#F8FAFC", borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  winnerLabel: { fontSize: 13, color: "#475569", fontWeight: "500", marginBottom: 4 },
  winnerAmount: { fontWeight: "800", color: "#059669" },
  winnerName: { fontWeight: "700", color: "#111827" },

  actionsContainer: { flexDirection: "row", gap: 10, marginTop: 20 },
  actionBtnPrimary: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#111827", paddingVertical: 10, borderRadius: 8 },
  actionBtnPrimaryText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  actionBtnSecondary: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF", borderWidth: 1, borderColor: "#EF4444", paddingVertical: 10, borderRadius: 8 },
  actionBtnSecondaryText: { color: "#EF4444", fontSize: 14, fontWeight: "600" },
  actionBtnSecondaryNeutral: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF", borderWidth: 1, borderColor: "#D1D5DB", paddingVertical: 10, borderRadius: 8 },
  actionBtnSecondaryNeutralText: { color: "#4B5563", fontSize: 14, fontWeight: "600" },
});
