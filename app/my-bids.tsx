import React from "react";
import { View, Text, StyleSheet } from "react-native";
import NavBuyer from "../components/navigation/NavBuyer";
import { Stack } from "expo-router";

export default function MyBids() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <NavBuyer />
                <View style={styles.content}>
                    <Text style={styles.title}>My Bids</Text>
                    <Text>Track your active and lost bids here.</Text>
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
