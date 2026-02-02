import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import NavFarmer from "../components/navigation/NavFarmer";
import { Stack } from "expo-router";

export default function FarmerDashboard() {
    const { t } = useTranslation();

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <NavFarmer />
                <ScrollView style={styles.content}>
                    <Text style={styles.title}>{t("farmer.dashboard_title")}</Text>
                    <View style={styles.card}>
                        <Text style={styles.cardText}>{t("farmer.welcome_msg")}</Text>
                        <Text style={styles.cardSubText}>{t("farmer.welcome_sub")}</Text>
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
        padding: 16,
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: "#2e7d32", // Forest green for farmer
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
    }
});
