import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function FarmerProfile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem("profile").then((p) => {
      if (p) setProfile(JSON.parse(p));
    });
  }, []);

  if (!profile) return null;

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.title}>Farmer Profile</Text>

      <View style={s.card}>
        <Row label="Name" value={profile.name} />
        <Row label="Phone" value={`+91 ${profile.phone}`} />
        <Row label="Location" value={profile.location || "Not set"} />
      </View>

      <View style={s.card}>
        <Text style={s.section}>Farm Tools</Text>

        <Action label="My Crops" onPress={() => {}} />
        <Action label="Add Crop" onPress={() => router.push("/add-crop")} />
        <Action
          label="Change Location"
          onPress={() => router.push("/profile-location")}
        />
      </View>

      <Logout />
    </ScrollView>
  );
}

function Row({ label, value }: any) {
  return (
    <View style={s.row}>
      <Text style={s.key}>{label}</Text>
      <Text style={s.val}>{value}</Text>
    </View>
  );
}

function Action({ label, onPress }: any) {
  return (
    <Pressable onPress={onPress} style={s.action}>
      <Text style={s.actionText}>{label}</Text>
    </Pressable>
  );
}

function Logout() {
  return (
    <Pressable
      onPress={async () => {
        await AsyncStorage.multiRemove(["token", "profile"]);
        router.replace("/login");
      }}
      style={s.logout}
    >
      <Text style={s.logoutText}>Logout</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#FAFAFA" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  section: { fontWeight: "800", marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  key: { color: "#6B7280", fontWeight: "700" },
  val: { fontWeight: "800" },

  action: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionText: { fontWeight: "700", color: "#2563EB" },

  logout: {
    marginTop: 20,
    padding: 14,
    borderRadius: 999,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
  },
  logoutText: { color: "#B91C1C", fontWeight: "800" },
});
