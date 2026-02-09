import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import NavFarmer from "../components/navigation/NavFarmer";
import type { CropListing } from "./add-crop";

export default function MyListings() {
  const router = useRouter();
  const { t } = useTranslation();
  const [listings, setListings] = useState<CropListing[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadListings = async () => {
    try {
      const storedListings = await AsyncStorage.getItem("cropListings");
      if (storedListings) {
        const parsedListings: CropListing[] = JSON.parse(storedListings);
        setListings(parsedListings);
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error("Error loading listings:", error);
      Alert.alert(t("alerts.error"), t("alerts.crop_save_failed"));
    }
  };

  // Load listings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const handleRemove = (id: string) => {
    console.log("Remove button pressed for ID:", id);

    if (Platform.OS === 'web') {
      const confirm = window.confirm(t("my_listings.confirm_remove_msg"));
      if (confirm) {
        performRemove(id);
      }
    } else {
      Alert.alert(
        t("my_listings.confirm_remove_title"),
        t("my_listings.confirm_remove_msg"),
        [
          {
            text: t("my_listings.cancel") || "Cancel", // Fallback if key missing or generically "Cancel"
            style: "cancel",
            onPress: () => console.log("Remove cancelled"),
          },
          {
            text: t("my_listings.remove"),
            style: "destructive",
            onPress: () => performRemove(id),
          },
        ]
      );
    }
  };

  const performRemove = async (id: string) => {
    try {
      console.log("Removing listing with ID:", id);
      const updatedListings = listings.filter(
        (listing) => listing.id !== id
      );
      await AsyncStorage.setItem(
        "cropListings",
        JSON.stringify(updatedListings)
      );
      setListings(updatedListings);

      if (Platform.OS !== 'web') {
        Alert.alert(t("alerts.success"), t("my_listings.remove_success"));
      } else {
        alert(t("my_listings.remove_success"));
      }
    } catch (error) {
      console.error("Error removing listing:", error);
      if (Platform.OS !== 'web') {
        Alert.alert(t("alerts.error"), t("my_listings.remove_failed"));
      } else {
        alert(t("my_listings.remove_failed"));
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <NavFarmer />
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.title}>{t("my_listings.title")}</Text>

          {listings.length === 0 ? (
            <Text style={styles.placeholder}>
              {t("my_listings.empty_state")}
            </Text>
          ) : (
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.categoryColumn]}>
                  {t("my_listings.category")}
                </Text>
                <Text style={[styles.headerCell, styles.cropColumn]}>{t("my_listings.crop")}</Text>
                <Text style={[styles.headerCell, styles.quantityColumn]}>
                  {t("my_listings.quantity")}
                </Text>
                <Text style={[styles.headerCell, styles.priceColumn]}>
                  {t("my_listings.price")}
                </Text>
                <Text style={[styles.headerCell, styles.actionColumn]}>
                  {t("my_listings.action")}
                </Text>
              </View>

              {/* Table Rows */}
              {listings.map((listing, index) => (
                <View
                  key={listing.id}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <Text style={[styles.cell, styles.categoryColumn]}>
                    {listing.category}
                  </Text>
                  <Text style={[styles.cell, styles.cropColumn]}>
                    {listing.crop}
                  </Text>
                  <Text style={[styles.cell, styles.quantityColumn]}>
                    {listing.quantity}
                  </Text>
                  <Text style={[styles.cell, styles.priceColumn]}>
                    ₹{listing.price}
                  </Text>
                  <View style={[styles.cell, styles.actionColumn]}>
                    <Pressable
                      onPress={() => handleRemove(listing.id)}
                      style={({ pressed }) => [
                        styles.removeButton,
                        pressed && styles.removeButtonPressed,
                      ]}
                    >
                      <Text style={styles.removeButtonText}>{t("my_listings.remove")}</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Pressable
            onPress={() => router.push("/add-crop")}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
          >
            <Text style={styles.addButtonText}>{t("my_listings.add_more")}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf5e6",
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a4b84",
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#c8e6c9",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1a4b84",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  evenRow: {
    backgroundColor: "#ffffff",
  },
  oddRow: {
    backgroundColor: "#f8fafc",
  },
  cell: {
    fontSize: 13,
    color: "#1a4b84",
    textAlign: "center",
    justifyContent: "center",
  },
  categoryColumn: {
    flex: 2,
  },
  cropColumn: {
    flex: 2,
  },
  quantityColumn: {
    flex: 1.5,
  },
  priceColumn: {
    flex: 1.5,
  },
  actionColumn: {
    flex: 1.5,
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeButtonPressed: {
    backgroundColor: "#b91c1c",
  },
  removeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#1a4b84",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#1a4b84",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonPressed: {
    transform: [{ translateY: 2 }],
    shadowOpacity: 0.1,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
