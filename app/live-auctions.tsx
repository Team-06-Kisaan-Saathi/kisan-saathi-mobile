import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import NavBuyer from "../components/navigation/NavBuyer";
import NavFarmer from "../components/navigation/NavFarmer";

export default function LiveAuctions() {
    // This could check for user role to show the right navbar
    // For now, let's just show a general view
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                {/* Minimal logic to show a navbar - in a real app you'd get this from a User Context */}
                <NavBuyer />
                <View style={styles.content}>
                    <Text style={styles.title}>Live Auctions</Text>
                    <Text>Real-time bidding events will be displayed here.</Text>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { padding: 20 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 }
});
