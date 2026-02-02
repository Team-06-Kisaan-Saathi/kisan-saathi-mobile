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

export default function NavFarmer() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <View style={styles.navFarmer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.navLeft}
                contentContainerStyle={styles.navLeftContent}
            >
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/(tabs)")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navText}>{t("nav_farmer.dashboard")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/my-listings")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navText}>{t("nav_farmer.my_listings")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/add-crop")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navText}>{t("nav_farmer.add_crop")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/mandi-prices")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navText}>{t("nav_farmer.mandi_prices")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/ai-insights")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navText}>{t("nav_farmer.ai_insights")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push("/live-auctions")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navText}>{t("nav_farmer.live_auctions")}</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.navRight}>
                <TouchableOpacity onPress={() => setOpen(!open)} activeOpacity={0.7}>
                    <Ionicons name="person-circle-outline" size={32} color="#bbf7d0" />
                </TouchableOpacity>

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
                                {t("nav_farmer.edit_profile")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => {
                                setOpen(false);
                                router.push("/farmer-preferences");
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dropdownText}>
                                {t("nav_farmer.edit_preferences")}
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
                            <Text style={styles.logoutText}>{t("nav_farmer.logout")}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    navFarmer: {
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
        fontSize: 15,
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
