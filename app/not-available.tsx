import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from '../hooks/ThemeContext';
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import NavAuto from "../components/navigation/NavAuto";


export default function NotAvailableScreen() {
    const { highContrast } = useTheme();
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <View style={[styles.container, highContrast && { backgroundColor: "#000" }]}>
            <Stack.Screen options={{ title: t("not_avail.title") || "Not Available", headerShown: false }} />
            <NavAuto />

            <View style={[styles.content, highContrast && { backgroundColor: "#000" }]}>
                <Ionicons name="construct-outline" size={80} color="#CBD5E1" />
                <Text style={[styles.title, highContrast && { color: "#FFF" }]}>{t("not_avail.title") || "Feature Not Available"}</Text>
                <Text style={[styles.subtitle, highContrast && { color: "#CCC" }]}>
                    {t("not_avail.sub") || "This feature is not available in the current build of Agri Bazaar."}
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.back()}
                >
                    <Text style={styles.buttonText}>{t("not_avail.back") || "Go Back"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        alignItems: "center",
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1E293B",
        marginTop: 24,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#64748B",
        textAlign: "center",
        marginTop: 12,
        lineHeight: 24,
    },
    button: {
        marginTop: 32,
        backgroundColor: "#1D4ED8",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 16,
    },
});
