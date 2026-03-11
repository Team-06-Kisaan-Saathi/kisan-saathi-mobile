import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '../hooks/ThemeContext';
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import NavAuto from "../components/navigation/NavAuto";
import { useTranslation } from "react-i18next";

import {
    FlatList,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    Linking,
    TextInput,
} from "react-native";
import { govtService, Scheme } from "../services/govtService";

/**
 * Govt Schemes Page
 * Displays agricultural schemes for farmers and buyers.
 */

export default function GovtSchemesScreen() {
    const { highContrast } = useTheme();
    const { t } = useTranslation();
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All"); // Added as per snippet

    const loadSchemes = async () => {
        try {
            const data = await govtService.getSchemes();
            setSchemes(data);
        } catch (e) {
            console.log("Error loading schemes:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadSchemes();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadSchemes();
    };

    const filteredSchemes = schemes.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderSchemeCard = ({ item }: { item: Scheme }) => (
        <View style={[styles.card, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}>
            <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Ionicons name="bookmark-outline" size={24} color={highContrast ? "#FFF" : "#64748B"} />
            </View>
            <Text style={[styles.title, highContrast && { color: "#FFF" }]}>{item.title}</Text>
            <Text style={[styles.description, highContrast && { color: "#AAA" }]}>{item.description}</Text>

            <View style={styles.detailsContainer}>
                <Text style={[styles.detailLabel, highContrast && { color: "#FFF" }]}>{t("schemes.benefits") || "Benefits:"}</Text>
                <Text style={[styles.detailText, highContrast && { color: "#AAA" }]}>{item.benefits}</Text>

                <Text style={[styles.detailLabel, { marginTop: 8 }, highContrast && { color: "#FFF" }]}>{t("schemes.eligibility") || "Eligibility:"}</Text>
                <Text style={[styles.detailText, highContrast && { color: "#AAA" }]}>{item.eligibility}</Text>
            </View>

            {item.link && (
                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => Linking.openURL(item.link!)}
                >
                    <Text style={styles.linkButtonText}>{t("schemes.official") || "Official Website"}</Text>
                    <Ionicons name="open-outline" size={16} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, highContrast && { backgroundColor: "#000" }]}>
            <Stack.Screen options={{
                title: t("schemes.title") || "Govt Schemes",
                headerShadowVisible: false,
                headerShown: false,
            }} />
            <NavAuto />
            <View style={styles.content}>
                {/* Search Bar */}
                <View style={[styles.searchContainer, highContrast && { backgroundColor: "#222", borderColor: "#444" }]}>
                    <Ionicons name="search" size={20} color="#64748B" />
                    <TextInput
                        style={[styles.searchInput, highContrast && { color: "#FFF" }]}
                        placeholder={t("schemes.search") || "Search schemes or categories..."}
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {loading && !refreshing ? (
                    <View style={[styles.center, highContrast && { backgroundColor: "#000" }]}>
                        <ActivityIndicator size="large" color="#1e3a8a" />
                    </View>
                ) : (
                    /* List of Schemes */
                    <FlatList
                        data={filteredSchemes}
                        renderItem={renderSchemeCard}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
                                <Text style={styles.emptyText}>{t("schemes.no_schemes") || "No Schemes Found"}</Text>
                                <Text style={styles.emptySubText}>{t("schemes.try_diff") || "Try a different search term."}</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f5f9",
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: "#f0fdf4",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        color: "#16a34a",
        fontSize: 12,
        fontWeight: "600",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
        lineHeight: 24,
    },
    desc: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 8,
        lineHeight: 20,
    },
    detailsBox: {
        backgroundColor: "#f8fafc",
        padding: 12,
        borderRadius: 12,
        marginTop: 16,
    },
    detailTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#334155",
        textTransform: "uppercase",
    },
    detailText: {
        fontSize: 13,
        color: "#475569",
        marginTop: 4,
        lineHeight: 18,
    },
    linkBtn: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
    },
    linkBtnText: {
        color: "#2563eb",
        fontSize: 14,
        fontWeight: "600",
        marginRight: 4,
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#64748b",
    },
    emptySub: {
        fontSize: 14,
        color: "#94a3b8",
        marginTop: 4,
    },
});
