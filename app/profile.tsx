// app/(tabs)/marketplace.tsx  (or wherever your "Marketplace / Mandis near me" screen lives)
//
// ✅ Fixes:
// 1) Uses SAVED profile location first (Azadpur dropdown / profile location)
// 2) Falls back to GPS only if profile location missing
// 3) Shows "Location source: PROFILE | GPS | NONE"
// 4) Removes deprecated SafeAreaView usage (uses react-native-safe-area-context)

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getProfile, updateLocation } from "../services/userServices";

const API = "http://10.104.34.251:5001/api";

type NearbyRow = {
  _id?: string;
  locationName?: string;
  coordinates?: [number, number]; // [lng, lat]
  distance?: number; // could be meters or km depending on backend
};

type LocationSource = "PROFILE" | "GPS" | "NONE";

export default function MarketplaceScreen() {
  const [loading, setLoading] = useState(true);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const [locationSource, setLocationSource] = useState<LocationSource>("NONE");
  const [activeLat, setActiveLat] = useState<number | null>(null);
  const [activeLng, setActiveLng] = useState<number | null>(null);
  const [activeAddress, setActiveAddress] = useState<string>("");

  const [nearbyRows, setNearbyRows] = useState<NearbyRow[]>([]);
  const [distKm] = useState(50);
  const [limit] = useState(5);

  // ---------- Helpers ----------
  const getTokenOrRedirect = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return null;
    }
    return token;
  }, []);

  const extractProfileLocation = (p: any) => {
    if (!p) return null;

    // address could be stored in many ways
    const address = String(
      p?.location?.address ??
        p?.location?.name ??
        p?.locationName ??
        (typeof p?.location === "string" ? p.location : "") ??
        "",
    ).trim();

    // Case A: { location: { lat, lng } }
    const locObj = p?.location;
    if (locObj && typeof locObj === "object") {
      const lat = Number(locObj.lat ?? locObj.latitude);
      const lng = Number(locObj.lng ?? locObj.longitude);
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat !== 0 &&
        lng !== 0
      ) {
        return { lat, lng, address };
      }
    }

    // Case B: { locationCoordinates: [lng, lat] }
    if (
      Array.isArray(p?.locationCoordinates) &&
      p.locationCoordinates.length >= 2
    ) {
      const lng = Number(p.locationCoordinates[0]);
      const lat = Number(p.locationCoordinates[1]);
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat !== 0 &&
        lng !== 0
      ) {
        return { lat, lng, address };
      }
    }

    return null;
  };

  const callNearby = useCallback(
    async (lat: number, lng: number) => {
      setNearbyLoading(true);
      try {
        const body = { lat, lng, distKm, limit };
        console.log("📡 loadNearby -> calling nearby with:", body);

        const res = await fetch(
          `${API}/mandi/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(
            lng,
          )}&distKm=${encodeURIComponent(distKm)}&limit=${encodeURIComponent(limit)}`,
        );

        const text = await res.text();
        console.log("🌐 nearby HTTP:", res.status, res.url);
        console.log("🌐 nearby RAW(first 200):", text.slice(0, 200));

        if (text.trim().startsWith("<")) {
          throw new Error(
            "Nearby API returned HTML (wrong route or server issue).",
          );
        }

        const json = JSON.parse(text);
        console.log("📦 /mandi/nearby raw:", json);

        const rows: NearbyRow[] = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.rows)
            ? json.rows
            : [];

        setNearbyRows(rows);
      } catch (e: any) {
        console.error("nearby error:", e);
        Alert.alert("Error", e?.message || "Failed to load nearby mandis");
        setNearbyRows([]);
      } finally {
        setNearbyLoading(false);
      }
    },
    [distKm, limit],
  );

  // ---------- Load profile location first ----------
  const loadLocationFromProfileOrGps = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getTokenOrRedirect();
      if (!token) return;

      const profRes = await getProfile(token);
      const user = profRes?.user || profRes?.data || profRes;

      const saved = extractProfileLocation(user);

      if (saved) {
        setLocationSource("PROFILE");
        setActiveLat(saved.lat);
        setActiveLng(saved.lng);
        setActiveAddress(saved.address || "Saved location");
        await callNearby(saved.lat, saved.lng);
        return;
      }

      // Fallback: GPS
      setLocationSource("NONE");
      setActiveAddress("");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationSource("NONE");
        setActiveLat(null);
        setActiveLng(null);
        setNearbyRows([]);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setLocationSource("GPS");
      setActiveLat(lat);
      setActiveLng(lng);

      // optional reverse geocode for UI
      try {
        const geo = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        const addr = geo?.[0]
          ? [geo[0].city, geo[0].region, geo[0].country]
              .filter(Boolean)
              .join(", ")
          : "GPS Location";
        setActiveAddress(addr);
      } catch {
        setActiveAddress("GPS Location");
      }

      await callNearby(lat, lng);
    } finally {
      setLoading(false);
    }
  }, [callNearby, getTokenOrRedirect]);

  useEffect(() => {
    loadLocationFromProfileOrGps();
  }, [loadLocationFromProfileOrGps]);

  // ---------- Button: force GPS and also save it to backend ----------
  const refreshWithGpsAndSave = useCallback(async () => {
    try {
      const token = await getTokenOrRedirect();
      if (!token) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Location permission was denied.");
        return;
      }

      setNearbyLoading(true);

      const pos = await Location.getCurrentPositionAsync({});
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      let address = "GPS Location";
      try {
        const geo = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        address = geo?.[0]
          ? [geo[0].city, geo[0].region, geo[0].country]
              .filter(Boolean)
              .join(", ")
          : "GPS Location";
      } catch {}

      // Save to backend so next time it becomes PROFILE source
      await updateLocation(token, { lat, lng, address });

      setLocationSource("GPS"); // currently using GPS
      setActiveLat(lat);
      setActiveLng(lng);
      setActiveAddress(address);

      await callNearby(lat, lng);
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message || "Failed to refresh location");
    } finally {
      setNearbyLoading(false);
    }
  }, [callNearby, getTokenOrRedirect]);

  const headerSubtitle = useMemo(() => {
    if (locationSource === "PROFILE") return "PROFILE";
    if (locationSource === "GPS") return "GPS";
    return "NONE";
  }, [locationSource]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.title}>Marketplace</Text>

          <Pressable
            style={styles.btn}
            onPress={refreshWithGpsAndSave}
            disabled={nearbyLoading}
          >
            <Ionicons name="navigate-circle-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Update location</Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Today's mandi prices, nearby markets & comparisons
        </Text>

        <Text style={styles.locationLine}>
          <Text style={{ fontWeight: "700" }}>Location source:</Text>{" "}
          {headerSubtitle}
        </Text>
        <Text style={styles.addressLine}>
          Location:{" "}
          {activeAddress
            ? activeAddress
            : "Not set (go to Profile → Change Location)"}
        </Text>

        <Text style={styles.coordsLine}>
          Coords:{" "}
          {activeLat != null && activeLng != null
            ? `${activeLat.toFixed(6)}, ${activeLng.toFixed(6)}`
            : "—"}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Nearest Mandis (within {distKm} km)
          </Text>

          {nearbyLoading ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator />
            </View>
          ) : nearbyRows.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No mandis found nearby</Text>
              <Text style={styles.tip}>
                Tip: try refreshing or updating location
              </Text>

              <Pressable
                onPress={() => router.push("/profile")}
                style={[styles.btnOutline, { marginTop: 12 }]}
              >
                <Text style={styles.btnOutlineText}>
                  Go to Profile → Change Location
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ marginTop: 10 }}>
              {nearbyRows.map((r, idx) => {
                const name = r.locationName || r._id || `Mandi ${idx + 1}`;
                const d = r.distance;
                // If your backend returns meters, show km; if it returns km, still looks OK.
                const prettyDist =
                  typeof d === "number"
                    ? d > 1000
                      ? `${(d / 1000).toFixed(1)} km`
                      : `${d.toFixed(0)} m`
                    : "";
                return (
                  <View key={`${name}-${idx}`} style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{name}</Text>
                      {!!prettyDist && (
                        <Text style={styles.rowSub}>
                          Distance: {prettyDist}
                        </Text>
                      )}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#64748b"
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* If you have a Map component, center it using activeLat/activeLng:
            - If locationSource is PROFILE, it will center on Delhi when you pick Azadpur
            - If GPS fallback, it will center on your current location
        */}
        <View style={styles.mapPlaceholder}>
          <Text style={{ color: "#64748b" }}>
            Map View (center using activeLat/activeLng)
            {"\n"}
            lat={String(activeLat)} lng={String(activeLng)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  coordsLine: { marginTop: 2, color: "#64748b", fontWeight: "600" },

  safe: { flex: 1, backgroundColor: "#f8fafc" },
  container: { padding: 16, paddingBottom: 30 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#0f172a" },
  subtitle: { color: "#64748b", marginTop: 6, marginBottom: 10 },

  locationLine: { marginTop: 6, color: "#64748b" },
  addressLine: { marginTop: 4, color: "#0f172a", fontWeight: "600" },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2e7d32",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnText: { color: "#fff", fontWeight: "700" },

  card: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },

  emptyBox: { paddingVertical: 14, alignItems: "center" },
  emptyText: { fontSize: 15, fontWeight: "700", color: "#334155" },
  tip: { marginTop: 6, color: "#2e7d32", fontWeight: "600" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rowTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  rowSub: { marginTop: 4, color: "#64748b" },

  btnOutline: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  btnOutlineText: { fontWeight: "700", color: "#0f172a" },

  mapPlaceholder: {
    marginTop: 14,
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
