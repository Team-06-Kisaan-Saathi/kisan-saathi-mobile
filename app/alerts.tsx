import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from '../hooks/ThemeContext';
import { Stack } from "expo-router";
import NavAuto from "../components/navigation/NavAuto";


export default function Alerts() {
  const { highContrast } = useTheme();
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.container, highContrast && { backgroundColor: "#000" }]}>
                <NavAuto />

                <View style={[styles.content, highContrast && { backgroundColor: "#000" }]}>
                    <Text style={[styles.title, highContrast && { color: "#FFF" }]}>Alerts</Text>
                    <Text style={styles.placeholder}>
                        Important notifications and market alerts will be shown here.
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
