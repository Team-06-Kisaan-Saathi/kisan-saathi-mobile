// app/profile-location.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/constants/api";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API = "http://10.12.252.131:5001/api";

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export default function ProfileLocation() {
  const params = useLocalSearchParams<{ phone?: string; lang?: string }>();
  const phone = String(params.phone ?? "");
  const lang = String(params.lang ?? "");

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");

  const [places, setPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Load dropdown places from backend
  const loadPlaces = async () => {
    try {
      console.log("📡 Fetching locations from backend..."); ///////////////////////////////debug
      const res = await fetch(`${API}/locations`);
      console.log("📡 /locations status:", res.status); ///////////////////////////debug
      if (!res.ok) {
        setMsg("Could not load places.");
        return;
      }

      const json = await res.json();
      console.log("📦 /locations response:", json); ////////////////debug
      if (json?.status === "SUCCESS" && Array.isArray(json.places)) {
        setPlaces(json.places);
      } else {
        setMsg("Unexpected locations response.");
      }
    } catch (e) {
      console.log("Failed to load places", e);
      setMsg("Network error while loading places.");
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

  // Save to backend (ALWAYS sends address + lat + lng)
  const saveLatLng = async (lat: number, lng: number, address: string) => {
    setLoading(true);
    setMsg("");

    try {
      const token = await AsyncStorage.getItem("token"); // change key if needed
      if (!token) {
        setMsg("Please login again.");
        return;
      }
      console.log("📤 Sending location to backend:");
      console.log({
        lat,
        lng,
        address,
      });

      const res = await fetch(`${API_BASE}/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lat, lng, address }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.log("Save failed:", res.status, text);
        setMsg("Could not save location. Try again.");
        return;
      }

      router.replace("/marketplace");
    } catch (e: any) {
      console.log("Save error:", e?.message || e);
      setMsg("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // GPS flow: get lat/lng + reverse geocode to address, then save
  const useGps = async () => {
    setMsg("");
    setLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setMsg("Location permission denied. Choose from list instead.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Reverse geocode -> build a readable address string
      const geo = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      const address = geo?.[0]
        ? [
            geo[0].name, // street/building (may be undefined)
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

  // Dropdown flow: use selected place name + lat/lng
  const onPickPlace = async (p: Place) => {
    setSelectedPlace(p);
    setEditing(false);
    setSearchQuery("");
    await saveLatLng(p.lat, p.lng, p.name);
  };

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

                <FlatList
                  data={filteredPlaces}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: 220 }}
                  renderItem={({ item }) => (
                    <Pressable
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
                  )}
                  ListEmptyComponent={
                    <Text style={s.emptyText}>
                      {places.length === 0 ? "Loading places..." : "No matches"}
                    </Text>
                  }
                />
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
