import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import NavFarmer from "../components/navigation/NavFarmer";

export default function FarmerPreferences() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <NavFarmer />
                <View style={styles.content}>
                    <Text style={styles.title}>Preferences</Text>
                    <Text style={styles.placeholder}>
                        Manage your crop preferences and notification settings.
                    </Text>
                </View>
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
