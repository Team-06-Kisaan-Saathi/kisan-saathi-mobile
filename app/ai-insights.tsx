import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Svg, Polyline, Line, Circle } from "react-native-svg";
import NavFarmer from "../components/navigation/NavFarmer";
import { fetchMandiPrices, MandiPriceDoc } from "../services/mandiService";

export default function AIInsightsScreen() {
    const [loading, setLoading] = useState(true);
    const [trends, setTrends] = useState<MandiPriceDoc[]>([]);
    const [crop, setCrop] = useState("Wheat");

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchMandiPrices({ crop, limit: 7 });
                setTrends(data.reverse()); // Oldest to newest
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [crop]);

    // Sparkline data calculation
    const getPoints = () => {
        if (trends.length < 2) return "";
        const max = Math.max(...trends.map(t => t.pricePerQuintal));
        const min = Math.min(...trends.map(t => t.pricePerQuintal));
        const range = max - min || 1;

        return trends.map((t, i) => {
            const x = (i / (trends.length - 1)) * 200;
            const y = 80 - ((t.pricePerQuintal - min) / range) * 60;
            return `${x},${y}`;
        }).join(" ");
    };

    return (
        <View style={styles.root}>
            <Stack.Screen options={{ headerShown: false }} />
            <NavFarmer />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>AI Market Advisor</Text>
                    <Text style={styles.subtitle}>Predictive modeling for your {crop} harvest</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
                ) : (
                    <>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Price Trend (Last 7 Days)</Text>
                                <View style={styles.trendBadge}>
                                    <Ionicons name="trending-up" size={12} color="#10B981" />
                                    <Text style={styles.trendText}>+3.4%</Text>
                                </View>
                            </View>

                            <View style={styles.chartContainer}>
                                <Svg height="100" width="100%">
                                    <Polyline
                                        points={getPoints()}
                                        fill="none"
                                        stroke="#3B82F6"
                                        strokeWidth="3"
                                    />
                                    {trends.map((t, i) => {
                                        const max = Math.max(...trends.map(d => d.pricePerQuintal));
                                        const min = Math.min(...trends.map(d => d.pricePerQuintal));
                                        const range = max - min || 1;
                                        const x = (i / (trends.length - 1)) * 260; // Adjusted for width
                                        const y = 80 - ((t.pricePerQuintal - min) / range) * 60;
                                        return <Circle key={i} cx={x} cy={y} r="4" fill="#3B82F6" />;
                                    })}
                                </Svg>
                                <View style={styles.chartLabels}>
                                    <Text style={styles.chartLabelText}>7 days ago</Text>
                                    <Text style={styles.chartLabelText}>Today</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.forecastGrid}>
                            <View style={[styles.forecastCard, { backgroundColor: "#DBEAFE" }]}>
                                <Text style={styles.forecastLabel}>3-Day Forecast</Text>
                                <Text style={styles.forecastValue}>₹2,450 - 2,510</Text>
                                <Text style={styles.forecastSub}>Upward trend likely</Text>
                            </View>
                            <View style={[styles.forecastCard, { backgroundColor: "#DCFCE7" }]}>
                                <Text style={styles.forecastLabel}>Best Time to Sell</Text>
                                <Text style={styles.forecastValue}>This Thursday</Text>
                                <Text style={styles.forecastSub}>Peak mandi activity</Text>
                            </View>
                        </View>

                        <View style={styles.adviceCard}>
                            <View style={styles.adviceHeader}>
                                <Ionicons name="bulb" size={24} color="#F59E0B" />
                                <Text style={styles.adviceTitle}>Smart Advice</Text>
                            </View>
                            <Text style={styles.adviceText}>
                                Based on weather patterns (Expected rain on Sat) and current Azadpur Mandi stocks,
                                we recommend harvesting early. Prices in nearby Sonipat are ₹40 higher than your current location.
                            </Text>
                            <TouchableOpacity style={styles.actionBtn}>
                                <Text style={styles.actionBtnText}>View Best Markets</Text>
                                <Ionicons name="arrow-forward" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.weatherStrip}>
                            <Ionicons name="rainy" size={24} color="#3B82F6" />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.weatherTitle}>Weather Alert: High Humidity</Text>
                                <Text style={styles.weatherDesc}>Risk of fungal growth. Ensure proper storage ventilation.</Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFC" },
    content: { padding: 16, paddingBottom: 40 },
    header: { marginBottom: 24, marginTop: 10 },
    title: { fontSize: 24, fontWeight: "bold", color: "#0F172A" },
    subtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },

    card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#E2E8F0" },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    cardTitle: { fontSize: 16, fontWeight: "bold", color: "#334155" },
    trendBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    trendText: { fontSize: 12, fontWeight: "bold", color: "#166534", marginLeft: 4 },

    chartContainer: { height: 120, justifyContent: "center", paddingHorizontal: 10 },
    chartLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    chartLabelText: { fontSize: 10, color: "#94A3B8" },

    forecastGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
    forecastCard: { flex: 1, padding: 16, borderRadius: 16, gap: 4 },
    forecastLabel: { fontSize: 11, color: "#1E3A8A", textTransform: "uppercase", fontWeight: "600" },
    forecastValue: { fontSize: 18, fontWeight: "bold", color: "#1E3A8A" },
    forecastSub: { fontSize: 11, color: "#1D4ED8" },

    adviceCard: { backgroundColor: "#FFFBEB", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "#FEF3C7", marginBottom: 20 },
    adviceHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    adviceTitle: { fontSize: 18, fontWeight: "bold", color: "#92400E" },
    adviceText: { fontSize: 14, color: "#92400E", lineHeight: 22 },
    actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#D97706", padding: 12, borderRadius: 12, marginTop: 16, gap: 8 },
    actionBtnText: { color: "#fff", fontWeight: "bold" },

    weatherStrip: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0" },
    weatherTitle: { fontSize: 14, fontWeight: "bold", color: "#0F172A" },
    weatherDesc: { fontSize: 12, color: "#64748B", marginTop: 2 },
});
