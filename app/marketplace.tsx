import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  Platform,
  ScrollView,
  Alert,
} from "react-native";

//Map
let MapView: any = null;
let Marker: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
} catch (e) {
  // if map not available - UI fallback
}

/** -----------------------------
 * Types  - (fetch from backend)
 * ----------------------------- */
type Crop = "Tomato" | "Onion" | "Potato" | "Wheat" | "Rice" | "Maize";

type PriceUnit = "₹/kg" | "₹/quintal";

type RawPriceRow = {
  mandiId: string;
  mandiName: string;
  crop: Crop;
  // raw formats can be messy (string / number / mixed units)
  price: number | string;
  unit: PriceUnit | "Rs/kg" | "Rs/quintal" | "INR/kg" | "INR/quintal";
  updatedAt: string; // ISO string
  quality?: "FAQ" | "Average" | "Premium";
};

type CleanPriceRow = {
  mandiId: string;
  mandiName: string;
  crop: Crop;
  pricePerKg: number; // standardized
  displayPrice: string; // e.g. "₹ 28.50 / kg"
  updatedAt: string; // ISO
  quality?: string;
};

type Mandi = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  district?: string;
  state?: string;
};

type LiveFeedItem = CleanPriceRow & {
  key: string;
};

type WatchItem = {
  crop: Crop;
  // last known avg price (for trigger demo)
  lastAvgPricePerKg?: number;
};

/** -----------------------------
 * Mock data
 * ----------------------------- */
const MOCK_MANDIS: Mandi[] = [
  { id: "m1", name: "APMC Mandi - Ameerpet", lat: 17.4375, lng: 78.4483, district: "Hyderabad", state: "Telangana" },
  { id: "m2", name: "APMC Mandi - Kukatpally", lat: 17.4948, lng: 78.3996, district: "Hyderabad", state: "Telangana" },
  { id: "m3", name: "APMC Mandi - Bowenpally", lat: 17.4760, lng: 78.4841, district: "Hyderabad", state: "Telangana" },
  { id: "m4", name: "APMC Mandi - Uppal", lat: 17.4055, lng: 78.5591, district: "Hyderabad", state: "Telangana" },
  { id: "m5", name: "APMC Mandi - LB Nagar", lat: 17.3456, lng: 78.5548, district: "Hyderabad", state: "Telangana" },
  { id: "m6", name: "APMC Mandi - Kompally", lat: 17.5397, lng: 78.4867, district: "Hyderabad", state: "Telangana" },
];

const ALL_CROPS: Crop[] = ["Tomato", "Onion", "Potato", "Wheat", "Rice", "Maize"];

/** -----------------------------
 * Utilities
 * ----------------------------- */
function nowIso() {
  return new Date().toISOString();
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Haversine distance in KM
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(s1 + s2));
  return R * c;
}

function normalizeUnit(unit: RawPriceRow["unit"]): PriceUnit {
  const u = unit.toLowerCase();
  if (u.includes("quintal")) return "₹/quintal";
  return "₹/kg";
}

// Convert various price + unit formats into pricePerKg
function cleansePriceRow(row: RawPriceRow): CleanPriceRow | null {
  const unit = normalizeUnit(row.unit);

  // parse price number safely
  let num: number | null = null;
  if (typeof row.price === "number") num = row.price;
  else {
    const cleaned = row.price.replace(/[₹, ]/g, "").trim();
    const parsed = Number(cleaned);
    num = Number.isFinite(parsed) ? parsed : null;
  }
  if (num === null) return null;

  // Standardize to ₹/kg
  let pricePerKg = num;
  if (unit === "₹/quintal") {
    // 1 quintal = 100 kg
    pricePerKg = num / 100;
  }

  // clamp/guard against weird values
  if (!Number.isFinite(pricePerKg) || pricePerKg <= 0) return null;

  return {
    mandiId: row.mandiId,
    mandiName: row.mandiName,
    crop: row.crop,
    pricePerKg,
    displayPrice: `₹ ${pricePerKg.toFixed(2)} / kg`,
    updatedAt: row.updatedAt,
    quality: row.quality ?? "—",
  };
}

/** -----------------------------
 * Mock “central mandi API fetch”
 * Replace this later with your backend call.
 * ----------------------------- */
async function mockFetchCentralMandiPrices(params: { crops?: Crop[]; mandiIds?: string[] }): Promise<RawPriceRow[]> {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 500));

  const crops = params.crops?.length ? params.crops : ALL_CROPS;
  const mandiIds = params.mandiIds?.length ? params.mandiIds : MOCK_MANDIS.map((m) => m.id);

  // generate “messy” price formats intentionally
  const rows: RawPriceRow[] = [];
  for (const mandiId of mandiIds) {
    const mandi = MOCK_MANDIS.find((m) => m.id === mandiId)!;

    // pick 2 random crops per mandi
    const picked = shuffle([...crops]).slice(0, 2);
    for (const crop of picked) {
      const useQuintal = Math.random() < 0.35; // mixed units
      const base = basePrice(crop);
      const variance = (Math.random() - 0.5) * 0.35 * base; // +/- 17.5%
      const pricePerKg = Math.max(3, base + variance);

      const unit: RawPriceRow["unit"] = useQuintal ? "Rs/quintal" : "INR/kg";
      const price = useQuintal
        ? `₹ ${(pricePerKg * 100).toFixed(0)}` // quintal
        : `${pricePerKg.toFixed(1)}`; // kg

      rows.push({
        mandiId,
        mandiName: mandi.name,
        crop,
        price,
        unit,
        updatedAt: nowIso(),
        quality: Math.random() < 0.33 ? "Premium" : Math.random() < 0.66 ? "FAQ" : "Average",
      });
    }
  }
  return rows;
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function basePrice(crop: Crop) {
  switch (crop) {
    case "Tomato":
      return 26;
    case "Onion":
      return 32;
    case "Potato":
      return 24;
    case "Wheat":
      return 20;
    case "Rice":
      return 36;
    case "Maize":
      return 18;
    default:
      return 25;
  }
}

/** -----------------------------
 * Location (placeholder)
 * Replace with Expo Location / RN Geolocation later.
 * ----------------------------- */
function useMockLocation() {
  // near Hyderabad by default (you can replace this later)
  const [coords, setCoords] = useState({ lat: 17.4375, lng: 78.4483 });
  const [permission, setPermission] = useState<"granted" | "denied" | "unknown">("unknown");

  const requestPermissionAndGet = async () => {
    // mock permission granted
    await new Promise((r) => setTimeout(r, 300));
    setPermission("granted");

    // small random drift to simulate movement
    setCoords((p) => ({
      lat: p.lat + (Math.random() - 0.5) * 0.01,
      lng: p.lng + (Math.random() - 0.5) * 0.01,
    }));
  };

  return { coords, permission, requestPermissionAndGet };
}

/** -----------------------------
 * Main Screen
 * ----------------------------- */
type TabKey = "Live" | "Nearby" | "Compare" | "Watchlist";

export default function MarketplaceScreen() {
  const { coords, permission, requestPermissionAndGet } = useMockLocation();

  // watchlist
  const [watch, setWatch] = useState<WatchItem[]>([
    { crop: "Tomato" },
    { crop: "Onion" },
  ]);

  // UI
  const [tab, setTab] = useState<TabKey>("Live");
  const [searchCrop, setSearchCrop] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // live feed + compare data
  const [feed, setFeed] = useState<LiveFeedItem[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  // auto refresh timer (live feed)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);


  const followedCrops = useMemo(() => watch.map((w) => w.crop), [watch]);

  // Nearby mandis (top 5)
  const nearestMandis = useMemo(() => {
    const withDist = MOCK_MANDIS.map((m) => ({
      ...m,
      distKm: distanceKm(coords.lat, coords.lng, m.lat, m.lng),
    })).sort((a, b) => a.distKm - b.distKm);

    return withDist.slice(0, 5);
  }, [coords.lat, coords.lng]);

  // Helper: fetch -> cleanse -> update state
  const fetchAndUpdate = async (reason: "auto" | "manual") => {
    try {
      const raw = await mockFetchCentralMandiPrices({
        crops: searchCrop.trim()
          ? ([titleCase(searchCrop.trim())] as Crop[])
          : undefined,
        mandiIds: nearestMandis.map((m) => m.id),
      });

      // cleanse
      const cleaned: CleanPriceRow[] = raw
        .map(cleansePriceRow)
        .filter(Boolean) as CleanPriceRow[];

      // build a live feed list
      const items: LiveFeedItem[] = cleaned
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .map((r, idx) => ({
          ...r,
          key: `${r.mandiId}-${r.crop}-${idx}-${r.updatedAt}`,
        }));

      setFeed(items);
      setLastUpdatedAt(nowIso());

      // mock “trigger notification” for watchlist price changes
      maybeTriggerWatchAlerts(cleaned, watch, setWatch, reason);
    } catch (e) {
      Alert.alert("Error", "Failed to load mandi prices (mock).");
    }
  };


  
  // first load
useEffect(() => {
  if (timerRef.current) clearInterval(timerRef.current);

  timerRef.current = setInterval(() => {
    if (tab === "Live") fetchAndUpdate("auto");
  }, 10000);

  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [tab, nearestMandis, searchCrop, watch]);


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAndUpdate("manual");
    setRefreshing(false);
  };

  // derived data for Compare table: aggregate best price per mandi for a chosen crop
  const compareCrop: Crop = useMemo(() => {
    const s = searchCrop.trim();
    const c = titleCase(s);
    return (ALL_CROPS.includes(c as Crop) ? (c as Crop) : "Tomato") as Crop;
  }, [searchCrop]);

  const compareRows = useMemo(() => {
    // take the latest entry per mandi for compareCrop
    const byMandi = new Map<string, CleanPriceRow>();

    for (const item of feed) {
      if (item.crop !== compareCrop) continue;
      const existing = byMandi.get(item.mandiId);
      if (!existing) {
        byMandi.set(item.mandiId, item);
      } else {
        if (new Date(item.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
          byMandi.set(item.mandiId, item);
        }
      }
    }

    const rows = Array.from(byMandi.values()).sort((a, b) => b.pricePerKg - a.pricePerKg);
    const best = rows[0]?.mandiId ?? null;

    return rows.map((r) => ({ ...r, isBest: r.mandiId === best }));
  }, [feed, compareCrop]);

  return (
    <View style={styles.root}>
      <Header />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabButton label="Live" active={tab === "Live"} onPress={() => setTab("Live")} />
        <TabButton label="Nearby" active={tab === "Nearby"} onPress={() => setTab("Nearby")} />
        <TabButton label="Compare" active={tab === "Compare"} onPress={() => setTab("Compare")} />
        <TabButton label="Watchlist" active={tab === "Watchlist"} onPress={() => setTab("Watchlist")} />
      </View>

      {/* Search / Filter + Refresh */}
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
        Location: {permission === "granted" ? "On" : permission === "denied" ? "Off" : "Unknown"}
      </Text>

      {/* Content */}
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
          requestPermission={requestPermissionAndGet}
          nearestMandis={nearestMandis}
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

/** -----------------------------
 * Components
 * ----------------------------- */
function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Marketplace</Text>
      <Text style={styles.headerSub}>Live mandi prices • Nearby mandis • Compare • Watchlist</Text>
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingBottom: 28 }}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No price data</Text>
          <Text style={styles.emptySub}>Pull to refresh.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{item.crop}</Text>
            <Pressable onPress={() => onStarCrop(item.crop)} style={styles.starBtn}>
              <Text style={[styles.starText, isCropStarred(item.crop) && styles.starOn]}>
                {isCropStarred(item.crop) ? "★" : "☆"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.cardSub}>{item.mandiName}</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.price}>{item.displayPrice}</Text>
            <Text style={styles.time}>⏱ {formatTime(item.updatedAt)}</Text>
          </View>

          <Text style={styles.badge}>Quality: {item.quality}</Text>
        </View>
      )}
    />
  );
}

function NearbyMandis({
  coords,
  permission,
  requestPermission,
  nearestMandis,
}: {
  coords: { lat: number; lng: number };
  permission: "granted" | "denied" | "unknown";
  requestPermission: () => Promise<void>;
  nearestMandis: Array<Mandi & { distKm: number }>;
}) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your location</Text>
        <Text style={styles.sectionSub}>
          Lat: {coords.lat.toFixed(4)} • Lng: {coords.lng.toFixed(4)}
        </Text>

        <Pressable onPress={requestPermission} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>
            {permission === "granted" ? "Update Location" : "Enable Location"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearest 5 Mandis</Text>

        {nearestMandis.map((m) => (
          <View key={m.id} style={styles.listRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{m.name}</Text>
              <Text style={styles.listSub}>
                {(m.district ?? "") + (m.state ? `, ${m.state}` : "")}
              </Text>
            </View>
            <Text style={styles.km}>{m.distKm.toFixed(2)} km</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Map</Text>
        {MapView ? (
          <View style={styles.mapWrap}>
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={{
                latitude: coords.lat,
                longitude: coords.lng,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
            >
              {Marker && (
                <Marker
                  coordinate={{ latitude: coords.lat, longitude: coords.lng }}
                  title="You"
                  description="Current location"
                />
              )}

              {Marker &&
                nearestMandis.map((m) => (
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
            <Text style={styles.mapFallbackTitle}>Map not installed</Text>
            <Text style={styles.mapFallbackSub}>
              Install <Text style={{ fontWeight: "700" }}>react-native-maps</Text> to show the map,
              otherwise this fallback UI is fine for now.
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
  rows: Array<CleanPriceRow & { isBest: boolean }>;
  onStarCrop: (crop: Crop) => void;
  isCropStarred: (crop: Crop) => boolean;
}) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Compare prices: {crop}</Text>
          <Pressable onPress={() => onStarCrop(crop)} style={styles.starBtn}>
            <Text style={[styles.starText, isCropStarred(crop) && styles.starOn]}>
              {isCropStarred(crop) ? "★" : "☆"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionSub}>
          Sorted highest → lowest (best highlighted).
        </Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 2 }]}>Mandi</Text>
          <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Price</Text>
        </View>

        {rows.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No rows for {crop}</Text>
            <Text style={styles.emptySub}>Try Refresh or change crop.</Text>
          </View>
        ) : (
          rows.map((r) => (
            <View key={`${r.mandiId}-${r.crop}`} style={[styles.tableRow, r.isBest && styles.bestRow]}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.tdTitle, r.isBest && styles.bestText]} numberOfLines={2}>
                  {r.mandiName}
                </Text>
                <Text style={styles.tdSub}>Updated: {formatTime(r.updatedAt)}</Text>
              </View>
              <Text style={[styles.tdPrice, r.isBest && styles.bestText]}>{r.displayPrice}</Text>
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
    // compute avg price/kg per crop from latestFeed
    const map = new Map<Crop, { sum: number; count: number }>();
    for (const it of latestFeed) {
      const v = map.get(it.crop) ?? { sum: 0, count: 0 };
      v.sum += it.pricePerKg;
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
          Follow crops to track prices and trigger notifications (backend later).
        </Text>

        {watch.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No watched crops</Text>
            <Text style={styles.emptySub}>Star a crop from Live or Compare.</Text>
          </View>
        ) : (
          watch.map((w) => {
            const avg = latestAvg.get(w.crop);
            return (
              <View key={w.crop} style={styles.watchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.watchTitle}>{w.crop}</Text>
                  <Text style={styles.watchSub}>
                    Avg now: {avg ? `₹ ${avg.toFixed(2)} / kg` : "—"}
                  </Text>
                </View>

                <Pressable onPress={() => onRemove(w.crop)} style={styles.removeBtn}>
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
          When connected to backend: store watched crops, compare new prices vs old, and send push/SMS when change crosses a threshold.
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

/** -----------------------------
 * Watchlist helpers + “trigger demo”
 * ----------------------------- */
function toggleWatchCrop(crop: Crop, watch: WatchItem[], setWatch: React.Dispatch<React.SetStateAction<WatchItem[]>>) {
  const exists = watch.some((w) => w.crop === crop);
  if (exists) {
    setWatch(watch.filter((w) => w.crop !== crop));
  } else {
    setWatch([...watch, { crop }]);
  }
}

function maybeTriggerWatchAlerts(
  cleaned: CleanPriceRow[],
  watch: WatchItem[],
  setWatch: React.Dispatch<React.SetStateAction<WatchItem[]>>,
  reason: "auto" | "manual"
) {
  // Demo logic:
  // compute avg per watched crop, compare with stored lastAvgPricePerKg, if changed by >= 10% => show alert
  const watched = new Set(watch.map((w) => w.crop));
  const agg = new Map<Crop, { sum: number; count: number }>();

  for (const r of cleaned) {
    if (!watched.has(r.crop)) continue;
    const v = agg.get(r.crop) ?? { sum: 0, count: 0 };
    v.sum += r.pricePerKg;
    v.count += 1;
    agg.set(r.crop, v);
  }

  const updates: WatchItem[] = watch.map((w) => {
    const v = agg.get(w.crop);
    if (!v) return w;

    const avg = v.sum / Math.max(1, v.count);
    const prev = w.lastAvgPricePerKg;

    // store the new avg
    const updated: WatchItem = { ...w, lastAvgPricePerKg: avg };

    if (prev && prev > 0) {
      const pct = Math.abs(avg - prev) / prev;
      if (pct >= 0.1 && reason === "manual") {
        // Only pop alert on manual refresh (so auto refresh doesn't annoy user)
        Alert.alert(
          "Watchlist Alert",
          `${w.crop} price changed by ${(pct * 100).toFixed(0)}% (avg now ₹ ${avg.toFixed(2)} / kg)`
        );
      }
    }
    return updated;
  });

  // Update stored “last avg” values
  setWatch(updates);
}

/** -----------------------------
 * Small helpers
 * ----------------------------- */
function titleCase(s: string) {
  // Make input like "tomato" -> "Tomato"
  // Keep safe for unknown crop names.
  if (!s) return s;
  const t = s.toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** -----------------------------
 * Styles
 * ----------------------------- */
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
  searchLabel: { color: "#8fa0b2", fontSize: 11, marginBottom: 6, fontWeight: "700" },
  searchInput: { color: "#fff", fontSize: 14, paddingVertical: Platform.OS === "android" ? 0 : 4 },

  refreshBtn: {
    backgroundColor: "#1f6feb",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  refreshText: { color: "#fff", fontWeight: "800" },

  meta: { color: "#a7b0bb", fontSize: 12, paddingHorizontal: 12, paddingBottom: 8 },

  card: {
    backgroundColor: "#101823",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e2a35",
    padding: 14,
    marginHorizontal: 12,
    marginTop: 10,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },
  cardSub: { color: "#9fb0c3", marginTop: 4, fontSize: 12 },
  price: { color: "#d7f7c2", marginTop: 10, fontSize: 16, fontWeight: "900" },
  time: { color: "#a7b0bb", marginTop: 10, fontSize: 12 },
  badge: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#0b0f14",
    borderWidth: 1,
    borderColor: "#223140",
    color: "#b7c2ce",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700",
  },

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
  listSub: { color: "#a7b0bb", marginTop: 2, fontSize: 12 },
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
  mapFallbackSub: { color: "#a7b0bb", marginTop: 6, fontSize: 12, lineHeight: 16 },

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
