import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { registerUser } from "../services/userServices";
import { ENDPOINTS } from "../services/api";
import { apiFetch } from "../services/http";

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};
export default function ProfileLocation() {
  const params = useLocalSearchParams<{
    phone?: string;
    lang?: string;
    name?: string;
    role?: string;
    pin?: string;
  }>();
  const phone = String(params.phone ?? "");
  const lang = String(params.lang ?? "en");
  const name = String(params.name ?? "");
  const role = String(params.role ?? "farmer");
  const pin = String(params.pin ?? "");

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");

  const [places, setPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // ... (helpers helpers remain same) ...

  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const normalizePlaces = (json: any): Place[] => {
    const list =
      json?.places ||
      json?.mandis ||
      json?.data ||
      json?.items ||
      json?.results ||
      json;

    if (!Array.isArray(list)) return [];

    return list
      .map((x: any, idx: number) => {
        const id = String(x?._id ?? x?.id ?? idx);

        // ✅ include fields your /mandi API actually returns
        const name = String(
          x?.locationName ??
          x?.mandi ?? // e.g., "Azadpur Mandi"
          x?.name ??
          x?.mandiName ??
          x?.market ??
          x?.place ??
          "Unknown",
        ).trim();

        // ✅ support more coordinate shapes
        const lat =
          x?.lat ??
          x?.latitude ??
          x?.location?.lat ??
          x?.location?.latitude ??
          x?.coords?.lat ??
          x?.locationCoordinates?.[1] ??
          x?.location?.coordinates?.[1]; // GeoJSON [lng, lat]

        const lng =
          x?.lng ??
          x?.longitude ??
          x?.location?.lng ??
          x?.location?.longitude ??
          x?.coords?.lng ??
          x?.locationCoordinates?.[0] ??
          x?.location?.coordinates?.[0]; // GeoJSON [lng, lat]

        return {
          id,
          name,
          lat: toNum(lat),
          lng: toNum(lng),
        } as Place;
      })
      .filter((p: Place) => p.name.length > 0);
  };

  const loadPlaces = async () => {
    try {
      setMsg("");
      console.log("📡 Fetching places from backend...");
      const json = await apiFetch<any>(ENDPOINTS.MARKET.LOCATIONS);

      console.log("📦 location response:", json);
      const mapped = normalizePlaces(json);

      if (mapped.length === 0) {
        setMsg("No places found from backend.");
      }
      setPlaces(mapped);
    } catch (e: any) {
      console.log("Failed to load places", e);
      setMsg(e.message || "Network error while loading places.");
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return places;
    return places.filter((p) => p.name.toLowerCase().includes(q));
  }, [searchQuery, places]);

  // ---- Save location to backend -------------------------------------------
  const saveLatLng = async (lat: number, lng: number, address: string) => {
    setLoading(true);
    setMsg("");

    try {
      console.log("📤 Registering user with all data...");

      const res = await registerUser({
        phone,
        pin,
        name,
        role,
        language: lang,
        location: { lat, lng, address },
      });

      console.log("✅ Registration successful", res);

      // ✅ Save session + role + cached profile
      if (res?.token) {
        await AsyncStorage.setItem("token", res.token);
      }
      if (res?.user) {
        await AsyncStorage.setItem(
          "role",
          String(res.user.role || "")
            .trim()
            .toLowerCase(),
        );
        await AsyncStorage.setItem("profile", JSON.stringify(res.user));
      }

      // Next step
      router.replace(
        role.toLowerCase() === "farmer"
          ? "/farmer-dashboard"
          : "/buyer-dashboard",
      );
    } catch (e: any) {
      console.log("Registration error:", e?.message || e);
      setMsg(e?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // GPS flow: get lat/lng + reverse geocode to address, then save
  const useGps = async () => {
    setMsg("");
    setLoading(true);

    try {
      console.log("📍 Requesting GPS permissions...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setMsg("Location permission denied. Choose from list instead.");
        return;
      }

      console.log("📍 Fetching current position (accuracy: balanced)...");
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      console.log(`📍 Position acquired: ${lat}, ${lng}`);

      console.log("📍 Reverse geocoding...");
      const geo = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      console.log("📍 Geocoding result:", geo?.[0]);

      const address = geo?.[0]
        ? [
          geo[0].name,
          geo[0].district,
          geo[0].city,
          geo[0].region,
          geo[0].country,
        ]
          .filter(Boolean)
          .join(", ")
        : "Current Location";

      await saveLatLng(lat, lng, address);
    } catch (e: any) {
      console.log("GPS error:", e?.message || e);
      setMsg("Could not get location. Choose from list instead.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => setEditing((v) => !v);

  const onPickPlace = async (p: Place) => {
    setSelectedPlace(p);
    setEditing(false);
    setSearchQuery("");
    await saveLatLng(p.lat, p.lng, p.name);
  };

  // -------------------------------------------------------------------------
  // NOTE: We removed FlatList to fix:
  // "VirtualizedLists should never be nested inside plain ScrollViews..."
  // We render the list manually since dropdown lists are typically small.
  // -------------------------------------------------------------------------

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <Text style={s.step}>Step 2 of 2</Text>
          <Text style={s.title}>Set your location</Text>
          <Text style={s.subtitle}>We'll show nearby mandis</Text>
        </View>

        <View style={s.actions}>
          <Pressable
            onPress={useGps}
            disabled={loading}
            style={({ pressed }) => [
              s.primaryAction,
              loading && s.actionDisabled,
              pressed && !loading && s.actionPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.primaryActionText}>Use Current Location</Text>
            )}
          </Pressable>

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <View>
            <Pressable
              onPress={toggleDropdown}
              style={({ pressed }) => [
                s.dropdownHeader,
                editing && s.dropdownHeaderActive,
                pressed && s.actionPressed,
              ]}
            >
              <Text
                style={[
                  s.dropdownHeaderText,
                  editing && s.dropdownHeaderTextActive,
                ]}
              >
                Choose from list
              </Text>
              <Text
                style={[s.dropdownChevron, editing && s.dropdownChevronActive]}
              >
                {editing ? "▲" : "▼"}
              </Text>
            </Pressable>

            {editing && (
              <View style={s.dropdownContent}>
                <Text style={s.label}>Search place</Text>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Type to filter (e.g., warangal)"
                  placeholderTextColor="#9CA3AF"
                  style={s.input}
                  editable={!loading}
                  autoFocus
                />

                <View style={{ maxHeight: 220 }}>
                  {filteredPlaces.length === 0 ? (
                    <Text style={s.emptyText}>
                      {places.length === 0 ? "Loading places..." : "No matches"}
                    </Text>
                  ) : (
                    <ScrollView
                      style={{ maxHeight: 220 }}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator
                    >
                      {filteredPlaces.map((item) => (
                        <Pressable
                          key={item.id}
                          onPress={() => onPickPlace(item)}
                          disabled={loading}
                          style={({ pressed }) => [
                            s.placeRow,
                            pressed && !loading && s.actionPressed,
                          ]}
                        >
                          <Text style={s.placeName}>{item.name}</Text>
                          <Text style={s.placeMeta}>
                            {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  )}
                </View>

                {filteredPlaces.length > 60 ? (
                  <Text style={s.hintText}>
                    Refine search to see more results…
                  </Text>
                ) : null}
              </View>
            )}

            {selectedPlace ? (
              <View style={s.selectedBox}>
                <Text style={s.selectedText}>
                  Selected: {selectedPlace.name} ({selectedPlace.lat.toFixed(4)}
                  , {selectedPlace.lng.toFixed(4)})
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {msg ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{msg}</Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAFA" },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: { marginBottom: 40 },
  step: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: "#6B7280", fontWeight: "500" },

  actions: { gap: 16 },

  primaryAction: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },

  dropdownHeader: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  dropdownHeaderActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownHeaderText: { color: "#374151", fontSize: 16, fontWeight: "600" },
  dropdownHeaderTextActive: { color: "#1D4ED8" },
  dropdownChevron: { fontSize: 12, color: "#9CA3AF", fontWeight: "700" },
  dropdownChevronActive: { color: "#3B82F6" },

  dropdownContent: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#3B82F6",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    gap: 12,
  },

  label: { fontSize: 14, fontWeight: "600", color: "#374151" },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },

  placeRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  placeName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  placeMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyText: { paddingVertical: 12, color: "#6B7280" },
  hintText: { paddingTop: 8, color: "#6B7280", fontSize: 12 },

  selectedBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  selectedText: { color: "#1D4ED8", fontWeight: "600" },

  actionDisabled: { backgroundColor: "#D1D5DB" },
  actionPressed: { opacity: 0.7 },

  errorBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#DC2626",
  },
  errorText: { color: "#991B1B", fontSize: 14, fontWeight: "500" },
});
