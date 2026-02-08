import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import NavFarmer from "../components/navigation/NavFarmer";

export default function MandiPrices() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <NavFarmer />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Mandi Prices</Text>
          <Text style={styles.placeholder}>
            Real-time prices from nearby mandis will be displayed here.
          </Text>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
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
  },
});
