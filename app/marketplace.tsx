import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLocation } from "../hooks/useLocation";
import {
  Crop,
  fetchMandiPrices,
  fetchNearbyMandis,
  MandiPriceDoc,
} from "../services/mandiService";

// Map (optional dependency)
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

try {
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE; // use google provider on Android when available
} catch (e) {
  // react-native-maps not installed (optional)
}

type TabKey = "Live" | "Nearby" | "Compare" | "Watchlist";

type WatchItem = { crop: Crop; lastAvgPricePerQuintal?: number };

type LiveFeedItem = {
  key: string;
  crop: Crop;
  mandiName: string;
  pricePerQuintal: number;
  displayPrice: string;
  updatedAt: string;
  quality?: string;
};

function formatTime(isoLike: string) {
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ALL_CROPS: Crop[] = [
  "Tomato",
  "Onion",
  "Potato",
  "Wheat",
  "Rice",
  "Maize",
];

export default function MarketplaceScreen() {
  const { coords, permission, requestAndGetLocation } = useLocation();

  const [tab, setTab] = useState<TabKey>("Live");
  const [searchCrop, setSearchCrop] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [nearbyMandis, setNearbyMandis] = useState<
    Array<{
      id: string;
      name: string;
      lat: number;
      lng: number;
      distKm: number;
    }>
  >([]);

  const [feed, setFeed] = useState<LiveFeedItem[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const [watch, setWatch] = useState<WatchItem[]>([
    { crop: "Tomato" },
    { crop: "Onion" },
  ]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedCrop: Crop | null = useMemo(() => {
    const c = titleCase(searchCrop.trim());
    return ALL_CROPS.includes(c as Crop) ? (c as Crop) : null;
  }, [searchCrop]);

  // Normalize backend response -> always return an array
  const normalizeArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.mandis)) return res.mandis;
    if (Array.isArray(res?.results)) return res.results;
    return [];
  };

  const loadNearby = async () => {
    if (!coords) return;

    try {
      const res = await fetchNearbyMandis({
        lat: coords.lat,
        lng: coords.lng,
        distKm: 50, // keep 50 for real use
        limit: 5,
      });

      const mandis = normalizeArray(res);

      setNearbyMandis(
        mandis
          .map((m: any) => {
            const lat = Number(m.lat ?? m.coordinates?.[1]);
            const lng = Number(m.lng ?? m.coordinates?.[0]);

            return {
              id: String(m.mandiId ?? m._id ?? m.id ?? m.mandi ?? ""),
              name: String(
                m.mandiName ?? m.locationName ?? m.name ?? "Unknown",
              ),
              lat,
              lng,
              distKm: Number(m.distanceKm ?? m.distKm ?? 0),
            };
          })
          .filter((m: any) => Number.isFinite(m.lat) && Number.isFinite(m.lng)),
      );
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load nearby mandis.");
      setNearbyMandis([]);
    }
  };

  const loadPrices = async (reason: "auto" | "manual") => {
    try {
      const res = await fetchMandiPrices({
        crop: selectedCrop ?? undefined,
        sort: "latest",
      });

      const prices = normalizeArray(res);

      const items: LiveFeedItem[] = prices.map((p: any, idx: number) => {
        const price = Number(p.pricePerQuintal || 0);
        const updatedAt = p.updatedAt || p.date || new Date().toISOString();

        return {
          key: `${p._id ?? p.id ?? "row"}-${idx}`,
          crop: p.crop,
          mandiName: p.locationName || p.mandi || "Unknown mandi",
          pricePerQuintal: price,
          displayPrice: `₹ ${price.toFixed(0)} / quintal`,
          updatedAt,
          quality: p.quality,
        };
      });

      items.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      setFeed(items);
      setLastUpdatedAt(new Date().toISOString());

      maybeTriggerWatchAlertsQuintal(items, watch, setWatch, reason);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load mandi prices.");
      setFeed([]);
    }
  };

  // Initial: request location + load prices
  useEffect(() => {
    (async () => {
      if (permission !== "granted") {
        await requestAndGetLocation();
      }
      await loadPrices("manual");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When coords becomes available / changes -> load nearby
  useEffect(() => {
    if (coords) loadNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng]);

  // Auto refresh live feed every 10s when on Live tab
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (tab === "Live") loadPrices("auto");
    }, 10000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedCrop, watch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadNearby(), loadPrices("manual")]);
    setRefreshing(false);
  };

  // Compare
  const compareCrop: Crop = useMemo(
    () => selectedCrop ?? "Tomato",
    [selectedCrop],
  );
  const [compareRows, setCompareRows] = useState<MandiPriceDoc[]>([]);

  const loadCompare = async () => {
    try {
      const res = await fetchMandiPrices({
        crop: compareCrop,
        sort: "price_desc",
      });

      const rows = normalizeArray(res) as MandiPriceDoc[];
      setCompareRows(rows);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load compare data.");
      setCompareRows([]);
    }
  };

  useEffect(() => {
    if (tab === "Compare") loadCompare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, compareCrop]);

  return (
    <View style={styles.root}>
      <Header />

      <View style={styles.tabs}>
        <TabButton
          label="Live"
          active={tab === "Live"}
          onPress={() => setTab("Live")}
        />
        <TabButton
          label="Nearby"
          active={tab === "Nearby"}
          onPress={() => setTab("Nearby")}
        />
        <TabButton
          label="Compare"
          active={tab === "Compare"}
          onPress={() => setTab("Compare")}
        />
        <TabButton
          label="Watchlist"
          active={tab === "Watchlist"}
          onPress={() => setTab("Watchlist")}
        />
      </View>

      <View style={styles.controls}>
        <View style={styles.searchBox}>
          <Text style={styles.searchLabel}>Crop</Text>
          <TextInput
            value={searchCrop}
            onChangeText={setSearchCrop}
            placeholder="e.g. Tomato, Onion…"
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
        </View>

        <Pressable onPress={onRefresh} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      <Text style={styles.meta}>
        {lastUpdatedAt ? `Updated: ${formatTime(lastUpdatedAt)}` : "Updating…"}
        {"  •  "}
        Location:{" "}
        {permission === "granted"
          ? "On"
          : permission === "denied"
            ? "Off"
            : "Unknown"}
      </Text>

      {tab === "Live" && (
        <LiveFeed
          feed={feed}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onStarCrop={(crop) => toggleWatchCrop(crop, watch, setWatch)}
          isCropStarred={(crop) => watch.some((w) => w.crop === crop)}
        />
      )}

      {tab === "Nearby" && (
        <NearbyMandis
          coords={coords}
          permission={permission}
          onEnableLocation={requestAndGetLocation}
          nearestMandis={nearbyMandis}
        />
      )}

      {tab === "Compare" && (
        <CompareTable
          crop={compareCrop}
          rows={compareRows}
          onStarCrop={(c) => toggleWatchCrop(c, watch, setWatch)}
          isCropStarred={(c) => watch.some((w) => w.crop === c)}
        />
      )}

      {tab === "Watchlist" && (
        <Watchlist
          watch={watch}
          onRemove={(crop) => toggleWatchCrop(crop, watch, setWatch)}
          latestFeed={feed}
        />
      )}
    </View>
  );
}

/** UI Components */
function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Marketplace</Text>
      <Text style={styles.headerSub}>
        Live mandi prices • Nearby mandis • Compare • Watchlist
      </Text>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, active && styles.tabBtnActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function LiveFeed({
  feed,
  refreshing,
  onRefresh,
  onStarCrop,
  isCropStarred,
}: {
  feed: LiveFeedItem[];
  refreshing: boolean;
  onRefresh: () => void;
  onStarCrop: (crop: Crop) => void;
  isCropStarred: (crop: Crop) => boolean;
}) {
  return (
    <FlatList
      data={feed}
      keyExtractor={(it) => it.key}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 28 }}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No price data</Text>
          <Text style={styles.emptySub}>
            Add mandi prices in DB and refresh.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{item.crop}</Text>
            <Pressable
              onPress={() => onStarCrop(item.crop)}
              style={styles.starBtn}
            >
              <Text
                style={[
                  styles.starText,
                  isCropStarred(item.crop) && styles.starOn,
                ]}
              >
                {isCropStarred(item.crop) ? "★" : "☆"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.cardSub}>{item.mandiName}</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.price}>{item.displayPrice}</Text>
            <Text style={styles.time}>⏱ {formatTime(item.updatedAt)}</Text>
          </View>
        </View>
      )}
    />
  );
}

function NearbyMandis({
  coords,
  permission,
  onEnableLocation,
  nearestMandis,
}: {
  coords: { lat: number; lng: number } | null;
  permission: "granted" | "denied" | "unknown";
  onEnableLocation: () => Promise<void>;
  nearestMandis: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    distKm: number;
  }>;
}) {
  const hasCoords = !!coords;

  // ✅ Controlled region so the map updates when coords change
  const region = useMemo(() => {
    if (!coords) return null;
    return {
      latitude: Number(coords.lat),
      longitude: Number(coords.lng),
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [coords?.lat, coords?.lng]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your location</Text>

        {hasCoords ? (
          <Text style={styles.sectionSub}>
            Lat: {coords!.lat.toFixed(4)} • Lng: {coords!.lng.toFixed(4)}
          </Text>
        ) : (
          <Text style={styles.sectionSub}>
            Location not available yet. Please enable location.
          </Text>
        )}

        <Pressable onPress={onEnableLocation} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>
            {permission === "granted" ? "Update Location" : "Enable Location"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearest Mandis</Text>

        {nearestMandis.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No nearby mandis</Text>
            <Text style={styles.emptySub}>
              Add mandi points near your current location (within 50 km).
            </Text>
          </View>
        ) : (
          nearestMandis.map((m) => (
            <View key={m.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{m.name}</Text>
              </View>
              <Text style={styles.km}>{m.distKm.toFixed(2)} km</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Map</Text>

        {MapView && hasCoords && region ? (
          <View style={styles.mapWrap}>
            <MapView
              style={StyleSheet.absoluteFill}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              region={region}
              showsUserLocation={permission === "granted"}
              showsMyLocationButton={true}
            >
              {Marker && (
                <Marker
                  coordinate={{
                    latitude: Number(coords!.lat),
                    longitude: Number(coords!.lng),
                  }}
                  title="You"
                />
              )}

              {Marker &&
                nearestMandis
                  .map((m) => ({
                    ...m,
                    lat: Number(m.lat),
                    lng: Number(m.lng),
                  }))
                  .filter(
                    (m) => Number.isFinite(m.lat) && Number.isFinite(m.lng),
                  )
                  .map((m) => (
                    <Marker
                      key={m.id}
                      coordinate={{ latitude: m.lat, longitude: m.lng }}
                      title={m.name}
                      description={`${m.distKm.toFixed(2)} km away`}
                    />
                  ))}
            </MapView>
          </View>
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.mapFallbackTitle}>Map not ready</Text>
            <Text style={styles.mapFallbackSub}>
              {!MapView
                ? 'Install "react-native-maps" (Dev Client rebuild required).'
                : "Enable location to show the map."}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function CompareTable({
  crop,
  rows,
  onStarCrop,
  isCropStarred,
}: {
  crop: Crop;
  rows: MandiPriceDoc[];
  onStarCrop: (crop: Crop) => void;
  isCropStarred: (crop: Crop) => boolean;
}) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Compare prices: {crop}</Text>
          <Pressable onPress={() => onStarCrop(crop)} style={styles.starBtn}>
            <Text
              style={[styles.starText, isCropStarred(crop) && styles.starOn]}
            >
              {isCropStarred(crop) ? "★" : "☆"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionSub}>
          Sorted highest → lowest (best highlighted).
        </Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 2 }]}>Mandi</Text>
          <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>
            ₹ / quintal
          </Text>
        </View>

        {rows.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No rows for {crop}</Text>
            <Text style={styles.emptySub}>
              Add mandi price docs for this crop in DB.
            </Text>
          </View>
        ) : (
          rows.map((r: any) => (
            <View
              key={r._id}
              style={[styles.tableRow, r.isBestPrice && styles.bestRow]}
            >
              <View style={{ flex: 2 }}>
                <Text
                  style={[styles.tdTitle, r.isBestPrice && styles.bestText]}
                  numberOfLines={2}
                >
                  {r.locationName || r.mandi || "Unknown mandi"}
                </Text>
                <Text style={styles.tdSub}>
                  Updated:{" "}
                  {formatTime(
                    r.updatedAt || r.date || new Date().toISOString(),
                  )}
                </Text>
              </View>
              <Text style={[styles.tdPrice, r.isBestPrice && styles.bestText]}>
                ₹ {Number(r.pricePerQuintal || 0).toFixed(0)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Watchlist({
  watch,
  onRemove,
  latestFeed,
}: {
  watch: WatchItem[];
  onRemove: (crop: Crop) => void;
  latestFeed: LiveFeedItem[];
}) {
  const latestAvg = useMemo(() => {
    const map = new Map<Crop, { sum: number; count: number }>();
    for (const it of latestFeed) {
      const v = map.get(it.crop) ?? { sum: 0, count: 0 };
      v.sum += it.pricePerQuintal;
      v.count += 1;
      map.set(it.crop, v);
    }
    const out = new Map<Crop, number>();
    map.forEach((v, k) => out.set(k, v.sum / Math.max(1, v.count)));
    return out;
  }, [latestFeed]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Watchlist</Text>
        <Text style={styles.sectionSub}>
          Follow crops to track prices (backend notifications later).
        </Text>

        {watch.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No watched crops</Text>
            <Text style={styles.emptySub}>
              Star a crop from Live or Compare.
            </Text>
          </View>
        ) : (
          watch.map((w) => {
            const avg = latestAvg.get(w.crop);
            return (
              <View key={w.crop} style={styles.watchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.watchTitle}>{w.crop}</Text>
                  <Text style={styles.watchSub}>
                    Avg now: {avg ? `₹ ${avg.toFixed(0)} / quintal` : "—"}
                  </Text>
                </View>

                <Pressable
                  onPress={() => onRemove(w.crop)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>Remove</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backend trigger (later)</Text>
        <Text style={styles.sectionSub}>
          Store watched crops, compare new prices vs old, and send push/SMS when
          change crosses threshold.
        </Text>
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            Tip: Keep a “lastNotifiedPrice” per crop per user to avoid spam.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/** Watchlist helpers */
function toggleWatchCrop(
  crop: Crop,
  watch: WatchItem[],
  setWatch: React.Dispatch<React.SetStateAction<WatchItem[]>>,
) {
  const exists = watch.some((w) => w.crop === crop);
  setWatch(
    exists ? watch.filter((w) => w.crop !== crop) : [...watch, { crop }],
  );
}

function maybeTriggerWatchAlertsQuintal(
  feed: LiveFeedItem[],
  watch: WatchItem[],
  setWatch: React.Dispatch<React.SetStateAction<WatchItem[]>>,
  reason: "auto" | "manual",
) {
  const watched = new Set(watch.map((w) => w.crop));
  const agg = new Map<Crop, { sum: number; count: number }>();

  for (const r of feed) {
    if (!watched.has(r.crop)) continue;
    const v = agg.get(r.crop) ?? { sum: 0, count: 0 };
    v.sum += r.pricePerQuintal;
    v.count += 1;
    agg.set(r.crop, v);
  }

  const updates = watch.map((w) => {
    const v = agg.get(w.crop);
    if (!v) return w;

    const avg = v.sum / Math.max(1, v.count);
    const prev = w.lastAvgPricePerQuintal;
    const updated = { ...w, lastAvgPricePerQuintal: avg };

    if (prev && prev > 0 && reason === "manual") {
      const pct = Math.abs(avg - prev) / prev;
      if (pct >= 0.1) {
        Alert.alert(
          "Watchlist Alert",
          `${w.crop} changed ${(pct * 100).toFixed(0)}% (avg ₹ ${avg.toFixed(0)} / quintal)`,
        );
      }
    }
    return updated;
  });

  setWatch(updates);
}

function titleCase(s: string) {
  if (!s) return s;
  const t = s.toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Styles (unchanged from yours) */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b0f14" },
  header: { paddingTop: 14, paddingHorizontal: 16, paddingBottom: 10 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#a7b0bb", marginTop: 4, fontSize: 12 },

  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: "#121a22",
    borderWidth: 1,
    borderColor: "#1e2a35",
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: "#1a2632", borderColor: "#2b3f52" },
  tabText: { color: "#a7b0bb", fontWeight: "700", fontSize: 12 },
  tabTextActive: { color: "#ffffff" },

  controls: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 8,
    alignItems: "flex-end",
  },
  searchBox: {
    flex: 1,
    backgroundColor: "#121a22",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e2a35",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  searchLabel: {
    color: "#8fa0b2",
    fontSize: 11,
    marginBottom: 6,
    fontWeight: "700",
  },
  searchInput: {
    color: "#fff",
    fontSize: 14,
    paddingVertical: Platform.OS === "android" ? 0 : 4,
  },

  refreshBtn: {
    backgroundColor: "#1f6feb",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  refreshText: { color: "#fff", fontWeight: "800" },

  meta: {
    color: "#a7b0bb",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },

  card: {
    backgroundColor: "#101823",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e2a35",
    padding: 14,
    marginHorizontal: 12,
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },
  cardSub: { color: "#9fb0c3", marginTop: 4, fontSize: 12 },
  price: { color: "#d7f7c2", marginTop: 10, fontSize: 16, fontWeight: "900" },
  time: { color: "#a7b0bb", marginTop: 10, fontSize: 12 },

  starBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  starText: { fontSize: 20, color: "#a7b0bb" },
  starOn: { color: "#ffd166" },

  empty: { padding: 24, alignItems: "center" },
  emptyTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },
  emptySub: { color: "#a7b0bb", marginTop: 6, textAlign: "center" },

  section: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: "#101823",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e2a35",
    padding: 14,
  },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },
  sectionSub: { color: "#a7b0bb", marginTop: 6, fontSize: 12, lineHeight: 16 },

  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#1f6feb",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },

  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e2a35",
  },
  listTitle: { color: "#fff", fontWeight: "800" },
  km: { color: "#d7f7c2", fontWeight: "900" },

  mapWrap: {
    marginTop: 12,
    height: 240,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#223140",
  },
  mapFallback: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#223140",
    backgroundColor: "#0b0f14",
  },
  mapFallbackTitle: { color: "#fff", fontWeight: "900" },
  mapFallbackSub: {
    color: "#a7b0bb",
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
  },

  tableHeader: {
    marginTop: 12,
    flexDirection: "row",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e2a35",
    borderBottomWidth: 1,
    borderBottomColor: "#1e2a35",
  },
  th: { color: "#8fa0b2", fontWeight: "900", fontSize: 12 },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2a35",
    alignItems: "center",
  },
  bestRow: {
    backgroundColor: "#0b0f14",
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  bestText: { color: "#ffd166" },

  tdTitle: { color: "#fff", fontWeight: "900" },
  tdSub: { color: "#a7b0bb", marginTop: 2, fontSize: 12 },
  tdPrice: { flex: 1, textAlign: "right", color: "#d7f7c2", fontWeight: "900" },

  watchRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e2a35",
  },
  watchTitle: { color: "#fff", fontWeight: "900", fontSize: 14 },
  watchSub: { color: "#a7b0bb", marginTop: 2, fontSize: 12 },

  removeBtn: {
    backgroundColor: "#2a3846",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  removeBtnText: { color: "#fff", fontWeight: "900" },

  tipBox: {
    marginTop: 10,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#0b0f14",
    borderWidth: 1,
    borderColor: "#223140",
  },
  tipText: { color: "#a7b0bb", fontSize: 12, lineHeight: 16 },
});
