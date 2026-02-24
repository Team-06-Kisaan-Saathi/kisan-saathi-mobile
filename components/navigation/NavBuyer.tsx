import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";


/**
 * NavBuyer Component
 *
 * Description:
 * Top navigation bar for Buyer users.
 * Provides horizontal route navigation and profile dropdown actions.
 *
 * Used In:
 * - buyer-dashboard.tsx
 *
 * Responsibilities:
 * - Navigate between buyer-related routes
 * - Toggle profile dropdown menu
 * - Handle profile, preferences, and logout navigation
 *
 * Inputs:
 * - None (relies on router and i18n context)
 *
 * Outputs:
 * - Renders navigation UI
 * - Triggers navigation side effects via expo-router
 */


export default function NavBuyer() {
    const { t } = useTranslation();
    // Controls visibility of profile dropdown menu
    const [open, setOpen] = useState(false);

    {/* Top navigation container for Buyer role */ }
    return (
        <View style={styles.navBuyer}>
            {/* Horizontally scrollable navigation links */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.navLeft}
                contentContainerStyle={styles.navLeftContent}
            >
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/buyer-dashboard")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navText}>{t("nav_buyer.dashboard")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/browse-crops")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navText}>{t("nav_buyer.browse_crops")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/live-auc-buyer")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navText}>{t("nav_buyer.live_auctions")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/my-bids")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navText}>{t("nav_buyer.my_bids")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/market-insights")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navText}>{t("nav_buyer.market_insights")}</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Profile icon and dropdown menu */}
            <View style={styles.navRight}>
                <TouchableOpacity onPress={() => setOpen(!open)} activeOpacity={0.7}>
                    <Ionicons name="person-circle-outline" size={32} color="#bbf7d0" />
                </TouchableOpacity>

                {/* Conditional profile dropdown menu */}
                {open && (
                    <View style={styles.profileDropdown}>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => {
                                setOpen(false);
                                router.push("/edit-profile");
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dropdownText}>
                                {t("nav_buyer.edit_profile")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => {
                                setOpen(false);
                                router.push("/buyer-preferences");
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dropdownText}>
                                {t("nav_buyer.edit_preferences")}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.dropdownDivider} />

                        <TouchableOpacity
                            style={[styles.dropdownButton, styles.logoutBtn]}
                            onPress={() => {
                                setOpen(false);
                                router.push("/login");
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.logoutText}>{t("nav_buyer.logout")}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    navBuyer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#1a4b84",
        borderBottomWidth: 3,
        borderBottomColor: "#81c784",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10, // Increased elevation for Android
        zIndex: 1000, // Ensure it stays on top of content
    },
    navLeft: {
        flex: 1,
    },
    navLeftContent: {
        alignItems: "center",
        gap: 24,
        paddingRight: 16,
    },
    navItem: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    navText: {
        fontWeight: "600",
        color: "#fdf5e6",
        fontSize: 20,
    },
    navRight: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
    profileDropdown: {
        position: "absolute",
        top: 50,
        right: 0,
        width: 220,
        backgroundColor: "#fdfbf7",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        overflow: "hidden",
        zIndex: 1000,
    },
    dropdownButton: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        backgroundColor: "transparent",
    },
    dropdownText: {
        fontWeight: "600",
        color: "#1a365d",
        fontSize: 14,
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: "#cbd5e0",
        marginVertical: 4,
    },
    logoutBtn: {
        // Special styling for logout button
    },
    logoutText: {
        color: "#c53030",
        fontWeight: "600",
        fontSize: 14,
    },
});
