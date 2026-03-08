import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from '../hooks/ThemeContext';
import { Stack } from "expo-router";
import NavFarmer from "../components/navigation/NavFarmer";


export default function MyListings() {
  const { highContrast } = useTheme();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, highContrast && { backgroundColor: "#000" }]}>
        <NavFarmer />

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, highContrast && { color: "#FFF" }]}>My Listings</Text>
          <Text style={styles.placeholder}>
            Your active crop listings will appear here.
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
