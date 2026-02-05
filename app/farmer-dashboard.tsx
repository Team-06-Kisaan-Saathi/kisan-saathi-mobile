import React from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,} from "react-native";
import { useTranslation } from "react-i18next";
import { Stack, useRouter } from "expo-router";
import NavFarmer from "../components/navigation/NavFarmer";

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <NavFarmer />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Page Title */}
          <Text style={styles.title}>
            {t("farmer.dashboard_title")}
          </Text>

          {/* Welcome Card */}
          <View style={styles.card}>
            <Text style={styles.cardText}>
              {t("farmer.welcome_msg")}
            </Text>
            <Text style={styles.cardSubText}>
              {t("farmer.welcome_sub")}
            </Text>
          </View>

          {/* Quick Action Cards */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/add-crop")}
            >
              <Text style={styles.actionTitle}>
                {t("farmer.add_crop")}
              </Text>
              <Text style={styles.actionSub}>
                {t("farmer.add_crop_sub")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/my-listings")}
            >
              <Text style={styles.actionTitle}>
                {t("farmer.my_listings")}
              </Text>
              <Text style={styles.actionSub}>
                {t("farmer.my_listings_sub")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/mandi-prices")}
            >
              <Text style={styles.actionTitle}>
                {t("farmer.mandi_prices")}
              </Text>
              <Text style={styles.actionSub}>
                {t("farmer.mandi_prices_sub")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f8fa",
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1a4b84",
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#2e7d32",
  },

  cardText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  cardSubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },

  actionsContainer: {
    width: "100%",
    gap: 16,
  },

  actionCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#2e7d32",
  },

  actionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a4b84",
  },

  actionSub: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
});
