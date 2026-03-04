import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
    Modal,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Lucide from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { getProfile } from "../services/userServices";
import Nav from "../components/navigation/Nav";

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [logoutModal, setLogoutModal] = useState(false);

    // Settings State
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState({
        orders: true,
        prices: true,
        weather: true,
    });
    const [organicOnly, setOrganicOnly] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [sellingUnit, setSellingUnit] = useState("kg");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const storedRole = await AsyncStorage.getItem("role");
            setRole(storedRole);

            const profile = await getProfile();
            if (profile?.success) {
                setUser(profile.user);
            }

            // Load preferences from local storage if any
            const prefs = await AsyncStorage.getItem("user_settings");
            if (prefs) {
                const parsed = JSON.parse(prefs);
                setDarkMode(parsed.darkMode ?? false);
                setNotifications(parsed.notifications ?? { orders: true, prices: true, weather: true });
                setSellingUnit(parsed.sellingUnit ?? "kg");
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (updates: any) => {
        try {
            const current = await AsyncStorage.getItem("user_settings");
            const next = { ...(current ? JSON.parse(current) : {}), ...updates };
            await AsyncStorage.setItem("user_settings", JSON.stringify(next));
        } catch (e) {
            console.error("Save settings failed", e);
        }
    };

    const handleLogout = async () => {
        setLogoutModal(false);
        await AsyncStorage.clear();
        router.replace("/login");
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
            <Stack.Screen options={{ headerShown: false }} />
            <Nav />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* PROFILE SECTION */}
                <SectionHeader title="Profile" />
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.profileRow}
                        onPress={() => router.push("/edit-profile")}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.name?.charAt(0) || "U"}</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.nameText}>{user?.name || "User Name"}</Text>
                            <Text style={styles.roleText}>{role?.toUpperCase() || "FARMER"}</Text>
                            <Text style={styles.phoneText}>{user?.phone || "+91 XXXXXXXXXX"}</Text>
                        </View>
                        <Lucide.ChevronRight size={20} color="#94A3B8" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Lucide.UserCircle size={22} color="#3B82F6" />}
                        label="Edit Profile"
                        onPress={() => router.push("/edit-profile")}
                    />
                </View>

                {/* ROLE SPECIFIC: ADMIN SETTINGS */}
                {role === "admin" && (
                    <>
                        <SectionHeader title="Admin Controls" />
                        <View style={styles.card}>
                            <SettingRow
                                icon={<Lucide.ShieldCheck size={22} color="#1E3A8A" />}
                                label="Security Audit Logs"
                                onPress={() => Alert.alert("Audit Logs", "Viewing latest system activities...")}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon={<Lucide.Users size={22} color="#1E3A8A" />}
                                label="Manage Admin Roles"
                                onPress={() => Alert.alert("Admin Management", "Manage sub-admin permissions.")}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon={<Lucide.Megaphone size={22} color="#1E3A8A" />}
                                label="System Broadcasts"
                                onPress={() => router.push("/admin-dashboard")}
                            />
                        </View>
                    </>
                )}

                {/* ROLE SPECIFIC: FARMER DETAILS */}
                {role === "farmer" && (
                    <>
                        <SectionHeader title="Farm Details" />
                        <View style={styles.card}>
                            <SettingRow
                                icon={<Lucide.MapPin size={22} color="#10B981" />}
                                label="Farm Location"
                                value={user?.location || "Warangal, TS"}
                                onPress={() => router.push("/change-location")}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon={<Lucide.Maximize size={22} color="#10B981" />}
                                label="Total Land Area"
                                value="5.5 Acres"
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon={<Lucide.Sprout size={22} color="#10B981" />}
                                label="Main Crops"
                                value="Paddy, Chilli"
                            />
                            <View style={styles.divider} />
                            <ToggleRow
                                icon={<Lucide.Leaf size={22} color="#10B981" />}
                                label="Organic/Non-Organic"
                                value={organicOnly}
                                onValueChange={(val: boolean) => setOrganicOnly(val)}
                                subLabel={organicOnly ? "Only organic listings" : "All listings"}
                            />
                        </View>
                    </>
                )}

                {/* ROLE SPECIFIC: BUYER PREFERENCES */}
                {role === "buyer" && (
                    <>
                        <SectionHeader title="Buyer Preferences" />
                        <View style={styles.card}>
                            <SettingRow
                                icon={<Lucide.ShoppingBag size={22} color="#6366F1" />}
                                label="Preferred Crops"
                                value="Wheat, Maize"
                                onPress={() => router.push("/buyer-preferences")}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon={<Lucide.Truck size={22} color="#6366F1" />}
                                label="Delivery Address"
                                value="Hyderabad, TS"
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon={<Lucide.Heart size={22} color="#EF4444" />}
                                label="Saved Farmers"
                                value="12 Verified"
                            />
                        </View>
                    </>
                )}

                {/* MARKETPLACE SETTINGS */}
                <SectionHeader title="Marketplace Settings" />
                <View style={styles.card}>
                    <SettingRow
                        icon={<Lucide.Scale size={22} color="#F59E0B" />}
                        label="Default Selling Unit"
                        value={sellingUnit.toUpperCase()}
                        onPress={() => {
                            Alert.alert("Select Unit", "Choose your default unit", [
                                { text: "KG", onPress: () => { setSellingUnit("kg"); saveSettings({ sellingUnit: "kg" }); } },
                                { text: "TON", onPress: () => { setSellingUnit("ton"); saveSettings({ sellingUnit: "ton" }); } },
                                { text: "BAG", onPress: () => { setSellingUnit("bag"); saveSettings({ sellingUnit: "bag" }); } },
                            ]);
                        }}
                    />
                    <View style={styles.divider} />
                    <ToggleRow
                        icon={<Lucide.BellRing size={22} color="#F59E0B" />}
                        label="Order Alerts"
                        value={notifications.orders}
                        onValueChange={(v: boolean) => {
                            const next = { ...notifications, orders: v };
                            setNotifications(next);
                            saveSettings({ notifications: next });
                        }}
                    />
                    <View style={styles.divider} />
                    <ToggleRow
                        icon={<Lucide.TrendingUp size={22} color="#F59E0B" />}
                        label="Price Change Alerts"
                        value={notifications.prices}
                        onValueChange={(v: boolean) => {
                            const next = { ...notifications, prices: v };
                            setNotifications(next);
                            saveSettings({ notifications: next });
                        }}
                    />
                    <View style={styles.divider} />
                    <ToggleRow
                        icon={<Lucide.CloudSun size={22} color="#F59E0B" />}
                        label="Weather Alerts"
                        value={notifications.weather}
                        onValueChange={(v: boolean) => {
                            const next = { ...notifications, weather: v };
                            setNotifications(next);
                            saveSettings({ notifications: next });
                        }}
                    />
                </View>

                {/* ACCOUNT & SECURITY */}
                <SectionHeader title="Account & Security" />
                <View style={styles.card}>
                    <SettingRow
                        icon={<Lucide.Lock size={22} color="#64748B" />}
                        label="Change Password"
                        onPress={() => Alert.alert("Coming Soon", "Pin change is available during login.")}
                    />
                    <View style={styles.divider} />
                    <ToggleRow
                        icon={<Lucide.ShieldCheck size={22} color="#64748B" />}
                        label="Two-Factor Authentication"
                        value={twoFactor}
                        onValueChange={setTwoFactor}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Lucide.CreditCard size={22} color="#3B82F6" />}
                        label="Linked Bank Account"
                        value="SBI **** 4582"
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Lucide.History size={22} color="#64748B" />}
                        label="Transaction History"
                        onPress={() => router.push("/invoices")}
                    />
                </View>

                {/* APP SETTINGS */}
                <SectionHeader title="App Settings" />
                <View style={styles.card}>
                    <ToggleRow
                        icon={<Lucide.Moon size={22} color="#1E293B" />}
                        label="Dark Mode"
                        value={darkMode}
                        onValueChange={(v: boolean) => {
                            setDarkMode(v);
                            saveSettings({ darkMode: v });
                        }}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Lucide.Languages size={22} color="#1E293B" />}
                        label="Language"
                        value={i18n.language === "hi" ? "Hindi" : i18n.language === "te" ? "Telugu" : "English"}
                        onPress={() => {
                            Alert.alert("Select Language", "Choose app language", [
                                { text: "English", onPress: () => i18n.changeLanguage("en") },
                                { text: "Hindi", onPress: () => i18n.changeLanguage("hi") },
                                { text: "Telugu", onPress: () => i18n.changeLanguage("te") },
                            ]);
                        }}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={<Lucide.HelpCircle size={22} color="#1E293B" />}
                        label="Help & Support"
                        onPress={() => router.push("/call-support")}
                    />
                </View>

                {/* LOGOUT */}
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => setLogoutModal(true)}
                >
                    <Lucide.LogOut size={22} color="#EF4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Version 1.0.0 (Build 124)</Text>
                    <Text style={styles.footerNote}>© 2026 KrishiConnect Rural Tech</Text>
                </View>

            </ScrollView>

            {/* Logout Modal */}
            <Modal visible={logoutModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Lucide.AlertTriangle size={48} color="#EF4444" style={{ marginBottom: 16 }} />
                        <Text style={styles.modalTitle}>Confirm Logout</Text>
                        <Text style={styles.modalSub}>Are you sure you want to sign out from the app?</Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalCancel]}
                                onPress={() => setLogoutModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalDelete]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.modalDeleteText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

// --- SUB COMPONENTS ---

function SectionHeader({ title }: { title: string }) {
    return <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>;
}

function SettingRow({ icon, label, value, onPress }: any) {
    const isTappable = !!onPress;
    const Container = isTappable ? TouchableOpacity : View;

    return (
        <Container style={styles.row} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
                <View style={styles.iconContainer}>{icon}</View>
                <Text style={styles.labelText}>{label}</Text>
            </View>
            <View style={styles.rowRight}>
                {value && <Text style={styles.valueText}>{value}</Text>}
                {isTappable && <Lucide.ChevronRight size={18} color="#94A3B8" style={{ marginLeft: 8 }} />}
            </View>
        </Container>
    );
}

function ToggleRow({ icon, label, subLabel, value, onValueChange }: any) {
    return (
        <View style={styles.row}>
            <View style={styles.rowLeft}>
                <View style={styles.iconContainer}>{icon}</View>
                <View>
                    <Text style={styles.labelText}>{label}</Text>
                    {subLabel && <Text style={styles.subLabelText}>{subLabel}</Text>}
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
                thumbColor={value ? "#3B82F6" : "#F8FAFC"}
            />
        </View>
    );
}

// --- STYLES ---

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollContent: { padding: 20, paddingBottom: 100 },
    sectionHeader: {
        fontSize: 12,
        fontWeight: "800",
        color: "#64748B",
        letterSpacing: 1.2,
        marginBottom: 12,
        marginTop: 24,
        paddingLeft: 4
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 8,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        ...Platform.select({
            ios: {
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 12,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#3B82F6",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
    profileInfo: { flex: 1, marginLeft: 16 },
    nameText: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
    roleText: { fontSize: 12, fontWeight: "700", color: "#64748B", textTransform: "uppercase", marginTop: 2 },
    phoneText: { fontSize: 13, color: "#94A3B8", marginTop: 2 },

    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    labelText: { fontSize: 15, fontWeight: "600", color: "#334155" },
    subLabelText: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
    rowRight: { flexDirection: "row", alignItems: "center" },
    valueText: { fontSize: 14, fontWeight: "600", color: "#64748B" },

    divider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 12 },

    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF",
        marginTop: 32,
        paddingVertical: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#FEE2E2",
    },
    logoutText: { color: "#EF4444", fontSize: 16, fontWeight: "800", marginLeft: 12 },

    footer: { marginTop: 40, alignItems: "center", marginBottom: 20 },
    versionText: { fontSize: 12, fontWeight: "600", color: "#94A3B8" },
    footerNote: { fontSize: 11, color: "#CBD5E1", marginTop: 4 },

    modalBackdrop: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", alignItems: "center", padding: 24 },
    modalContent: { backgroundColor: "#FFF", width: "100%", borderRadius: 28, padding: 32, alignItems: "center" },
    modalTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginBottom: 8 },
    modalSub: { fontSize: 15, color: "#64748B", textAlign: "center", lineHeight: 22, marginBottom: 28 },
    modalButtons: { flexDirection: "row", gap: 12, width: "100%" },
    modalBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: "center" },
    modalCancel: { backgroundColor: "#F1F5F9" },
    modalDelete: { backgroundColor: "#EF4444" },
    modalCancelText: { color: "#475569", fontWeight: "700", fontSize: 15 },
    modalDeleteText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
