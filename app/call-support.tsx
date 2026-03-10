import React, { useState } from "react";
import { useTheme } from '../hooks/ThemeContext';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Linking,
    Alert,
    SafeAreaView,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import NavAuto from "../components/navigation/NavAuto";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { apiFetch } from "../services/http";

import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";

const { width, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function CallSupportScreen() {
    const router = useRouter();
    const { highContrast } = useTheme();
    const { t } = useTranslation();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [issueType, setIssueType] = useState("general");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCall = (number: string) => {
        Linking.openURL(`tel:${number.replace(/-/g, "")}`);
    };

    const handleRequestCallback = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert(t("support.invalid_title") || "Invalid Input", t("support.invalid") || "Please enter a valid phone number.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res: any = await apiFetch("/api/support/request", {
                method: "POST",
                body: JSON.stringify({ phone: phoneNumber, issueType }),
            });

            if (res.success) {
                Alert.alert(
                    t("support.success_title") || "Success",
                    t("support.success", { issueType: t(`support.iss_${issueType}`), phoneNumber }) || `Your callback request for ${t(`support.iss_${issueType}`)} has been submitted. Our executive will call you back shortly on ${phoneNumber}.`,
                    [{
                        text: "OK", onPress: () => {
                            setPhoneNumber("");
                            setIssueType("general");
                        }
                    }]
                );
            } else {
                Alert.alert(t("support.error_title") || "Error", res.message || t("support.failed_submit") || "Failed to submit request");
            }
        } catch (e) {
            Alert.alert(t("support.error_title") || "Error", t("support.server_error") || "Server connection failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, highContrast && { backgroundColor: "#000" }]}>
            <Stack.Screen options={{
                title: t("support.title") || "Support Center",
                headerShadowVisible: false,
                headerShown: false,
            }} />
            <NavAuto />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header Image/Icon Section */}
                    <View style={styles.headerSection}>
                        <View style={[styles.iconCircle, highContrast && { backgroundColor: "#222" }]}>
                            <Ionicons name="headset" size={64} color="#3B82F6" />
                        </View>
                        <Text style={[styles.mainTitle, highContrast && { color: "#FFF" }]}>{t("support.title") || "Support Center"}</Text>
                        <Text style={[styles.subTitle, highContrast && { color: "#CCC" }]}>{t("support.sub") || "We are here to help you"}</Text>
                    </View>

                    {/* Call Support Card */}
                    <View style={[styles.card, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="call" size={24} color="#F59E0B" />
                            <Text style={[styles.cardTitle, highContrast && { color: "#FFF" }]}>{t("support.call") || "Call Support"}</Text>
                        </View>
                        <Text style={[styles.cardDesc, highContrast && { color: "#AAA" }]}>{t("support.talk") || "Talk to our expert team"}</Text>

                        <View style={[styles.numberContainer, highContrast && { backgroundColor: "#222" }]}>
                            <Text style={[styles.tollFreeNumber, highContrast && { color: "#FFF" }]}>1800-123-4567</Text>
                            <Text style={[styles.tollFreeLabel, highContrast && { color: "#CCC" }]}>{t("support.toll_free") || "Toll-Free Number"}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: "#F59E0B" }]}
                            onPress={() => handleCall("1800-123-4567")}
                        >
                            <Ionicons name="call-outline" size={20} color="#FFF" />
                            <Text style={styles.actionBtnText}>{t("support.btn_call") || "Call Now"}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Request Callback Section */}
                    <View style={[styles.card, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="chatbubbles" size={24} color="#3B82F6" />
                            <Text style={[styles.cardTitle, highContrast && { color: "#FFF" }]}>{t("support.request") || "Request a Callback"}</Text>
                        </View>
                        <Text style={[styles.cardDesc, highContrast && { color: "#AAA" }]}>{t("support.reach") || "We will reach out to you"}</Text>

                        <Text style={[styles.inputLabel, highContrast && { color: "#CCC" }]}>{t("support.phone") || "Phone Number"}</Text>
                        <TextInput
                            style={[styles.input, highContrast && { backgroundColor: "#222", color: "#FFF", borderColor: "#444" }]}
                            placeholder={t("support.phone_pl") || "Enter your 10 digit mobile number"}
                            placeholderTextColor="#94A3B8"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />

                        <Text style={[styles.inputLabel, highContrast && { color: "#CCC" }]}>{t("support.issue") || "Issue Type"}</Text>
                        <View style={[styles.pickerContainer, highContrast && { backgroundColor: "#222", borderColor: "#444" }]}>
                            <Picker
                                selectedValue={issueType}
                                onValueChange={(itemValue) => setIssueType(itemValue)}
                                style={[styles.picker, highContrast && { color: "#FFF" }]}
                                dropdownIconColor={highContrast ? "#FFF" : "#64748B"}
                            >
                                <Picker.Item label={t("support.iss_pay") || "Payment Issue"} value="payment" />
                                <Picker.Item label={t("support.iss_ord") || "Order Issue"} value="order" />
                                <Picker.Item label={t("support.iss_del") || "Delivery Issue"} value="delivery" />
                                <Picker.Item label={t("support.iss_tech") || "Technical Problem"} value="technical" />
                                <Picker.Item label={t("support.iss_gen") || "General Inquiry"} value="general" />
                            </Picker>
                        </View>

                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#3B82F6' }, isSubmitting && styles.btnDisabled]}
                            onPress={handleRequestCallback}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="send-outline" size={20} color="#fff" />
                                    <Text style={styles.actionBtnText}>{t("support.btn_req") || "Request Callback"}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Emergency Helpline */}
                    <View style={[styles.card, styles.emergencyCard, highContrast && { backgroundColor: "#111", borderColor: "#DC262640" }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="alert-circle" size={24} color="#DC2626" />
                            <Text style={styles.emergencyTitle}>{t("support.em_help") || "Emergency Helpline"}</Text>
                        </View>
                        <Text style={styles.emergencyDesc}>
                            {t("support.em_desc") || "For urgent issues related to payments or fraud, contact our 24/7 dedicated helpline."}
                        </Text>
                        <TouchableOpacity
                            style={styles.callNowBtn}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="call" size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.callNowText}>{t("support.call_em_now") || "Call Emergency Now"}</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#FFF" },
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    scrollContent: { paddingBottom: 40, paddingHorizontal: 20 },

    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: "#FFF"
    },
    headerSection: { alignItems: "center", paddingVertical: 30 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
    mainTitle: { fontSize: 26, fontWeight: "900", color: "#0F172A", marginTop: 16 },
    subTitle: { fontSize: 16, color: "#64748B", marginTop: 8, fontWeight: "500" },
    title: { fontSize: 26, fontWeight: "900", color: "#0F172A", marginTop: 10 },
    subtitle: { fontSize: 16, color: "#64748B", marginTop: 4, fontWeight: "500" },
    cardDesc: { fontSize: 14, color: "#64748B", marginBottom: 16, lineHeight: 20 },
    inputLabel: { fontSize: 14, fontWeight: "700", color: "#475569", marginBottom: 8, marginTop: 12 },
    actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 8, marginTop: 16 },
    actionBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16, marginLeft: 8 },
    btnDisabled: { opacity: 0.7 },
    emergencyTitle: { fontSize: 18, fontWeight: "800", color: "#DC2626", marginLeft: 16 },
    emergencyDesc: { fontSize: 14, color: "#64748B", marginBottom: 16, lineHeight: 20 },

    card: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cardHeaderText: {
        marginLeft: 16,
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1E293B",
    },
    cardSubtitle: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 2,
        fontWeight: "500",
    },

    numberContainer: {
        alignItems: "center",
        paddingVertical: 15,
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        marginBottom: 20,
    },
    tollFreeNumber: {
        fontSize: 28,
        fontWeight: "900",
        color: "#0F172A",
        letterSpacing: 1,
    },
    tollFreeLabel: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: "700",
        marginTop: 4,
        textTransform: "uppercase",
    },

    callNowBtn: {
        backgroundColor: "#16A34A",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 8,
    },
    callNowText: {
        color: "#FFF",
        fontWeight: "800",
        fontSize: 16,
    },

    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        color: "#475569",
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#0F172A",
    },
    pickerContainer: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 8,
        overflow: "hidden",
    },
    picker: {
        height: 50,
        width: "100%",
    },
    requestBtn: {
        backgroundColor: "#16A34A",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 8,
        marginTop: 4,
    },
    requestBtnText: {
        color: "#FFF",
        fontWeight: "800",
        fontSize: 16,
    },

    emergencyCard: {
        borderColor: "#DC262640",
        borderWidth: 2,
    },
});
