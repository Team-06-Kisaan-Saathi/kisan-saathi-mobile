import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Platform,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NotificationBell from "../notifications/NotificationBell";
import { notificationService } from "../../services/NotificationService";
import { useTheme } from "../../hooks/ThemeContext";
import { useTranslation } from "react-i18next";

export default function NavFarmer() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const { highContrast } = useTheme();
    const { t } = useTranslation();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileAnim = useRef(new Animated.Value(0)).current;

    const navBg = highContrast ? "#000000" : PRIMARY;
    const textColor = highContrast ? "#FFFFFF" : "#FFF";

    useEffect(() => {
        Animated.spring(profileAnim, {
            toValue: profileOpen ? 1 : 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    }, [profileOpen]);

    const getPageTitle = (path: string) => {
        if (path.includes("farmer-dashboard")) return "nav_buyer.dashboard";
        if (path.includes("buyer-dashboard")) return "nav_buyer.dashboard";
        if (path.includes("marketplace")) return "farmer.marketplace";
        if (path.includes("mandi-prices")) return "nav_farmer.mandi_prices";
        if (path.includes("messages")) return "market.messages";
        if (path.includes("edit-profile")) return "profile.edit_title";
        if (path.includes("invoices")) return "nav.invoices";
        if (path.includes("govt-schemes")) return "dashboard.govt_schemes";
        if (path.includes("call-support")) return "nav.call_support";
        if (path.includes("ai-insights")) return "dashboard.market_forecast";
        if (path.includes("settings")) return "settings.title";
        if (path.includes("weather")) return "dashboard.weather";
        if (path.includes("notifications")) return "nav.notifications";
        return "";
    };

    const handleLogout = async () => {
        setProfileOpen(false);
        notificationService.disconnect();
        await AsyncStorage.clear();
        router.replace("/login");
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: navBg }]}>
            <View style={styles.navbar}>
                <TouchableOpacity
                    style={styles.brandBtn}
                    onPress={() => router.replace("/farmer-dashboard")}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.brandText, { color: textColor }]}>{t('nav.brand_agri')}</Text>
                </TouchableOpacity>

                <View style={styles.centerSection}>
                    <Text style={[styles.pageTitle, { color: textColor }]}>{t(getPageTitle(pathname))}</Text>
                </View>

                <View style={styles.rightSection}>
                    <NotificationBell color={textColor} />

                    {/* Profile */}
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => setProfileOpen(!profileOpen)}
                    >
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={18} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Profile Dropdown */}
            {profileOpen && (
                <>
                    <Pressable style={styles.backdrop} onPress={() => setProfileOpen(false)} />
                    <Animated.View style={[styles.dropdown, {
                        opacity: profileAnim,
                        transform: [{ scale: profileAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }]
                    }]}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownTitle}>{t('nav.farmer_acc')}</Text>
                        </View>
                        <DropdownItem icon="person-outline" label={t("profile.edit_title") || "Edit Profile"} onPress={() => { setProfileOpen(false); router.push("/edit-profile"); }} />
                        <DropdownItem icon="settings-outline" label={t("settings.title") || "Settings"} onPress={() => { setProfileOpen(false); router.push("/settings" as any); }} />
                        <View style={styles.divider} />
                        <DropdownItem icon="log-out-outline" label={t("auth.logout") || "Logout"} danger onPress={handleLogout} />
                    </Animated.View>
                </>
            )}
        </View>
    );
}

function DropdownItem({ icon, label, onPress, danger = false }: any) {
    return (
        <TouchableOpacity style={styles.dropdownItem} onPress={onPress}>
            <Ionicons name={icon} size={18} color={danger ? "#EF4444" : "#374151"} style={{ marginRight: 10 }} />
            <Text style={[styles.dropdownText, danger && { color: "#EF4444" }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const PRIMARY = "#15803D";
const PRIMARY_DARK = "#14532D";

const styles = StyleSheet.create({
    container: {
        backgroundColor: PRIMARY,
        zIndex: 1000,
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
            android: { elevation: 6 },
        }),
    },
    navbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 48,
        paddingHorizontal: 16,
    },
    brandBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    centerSection: {
        flex: 1.5,
        alignItems: "center",
        justifyContent: "center",
    },
    pageTitle: {
        color: "#BBF7D0",
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    rightSection: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 12,
    },
    brandText: {
        fontSize: 13,
        fontWeight: "900",
        color: "#FFF",
        lineHeight: 14,
        textAlign: "center",
        textTransform: "uppercase",
    },
    profileButton: {},
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: PRIMARY_DARK,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "transparent",
        zIndex: 1500,
    },
    dropdown: {
        position: "absolute",
        top: Platform.OS === "ios" ? 100 : 62,
        right: 12,
        width: 210,
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 6,
        zIndex: 2000,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 12 },
            android: { elevation: 10 },
        }),
    },
    dropdownHeader: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    dropdownTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 6,
    },
    dropdownText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 4,
    },
});
