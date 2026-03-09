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
} from "react-native";
import { Stack, useRouter } from "expo-router";
import NavAuto from "../components/navigation/NavAuto";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { apiFetch } from "../services/http";

import { Picker } from "@react-native-picker/picker";

const { width } = Dimensions.get("window");

const SupportScreen = () => {
    const router = useRouter();
    const { highContrast } = useTheme();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [issueType, setIssueType] = useState("Payment");

    const handleCall = (number: string) => {
        Linking.openURL(`tel:${number.replace(/-/g, "")}`);
    };

    const handleRequestCallback = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert("Invalid Input", "Please enter a valid phone number.");
            return;
        }

        try {
            const res: any = await apiFetch("/api/support/request", {
                method: "POST",
                body: JSON.stringify({ phone: phoneNumber, issueType }),
            });

            if (res.success) {
                Alert.alert(
                    "Success",
                    `Your callback request for ${issueType} has been submitted. Our executive will call you back shortly on ${phoneNumber}.`,
                    [{
                        text: "OK", onPress: () => {
                            setPhoneNumber("");
                            setIssueType("Payment");
                        }
                    }]
                );
            } else {
                Alert.alert("Error", res.message || "Failed to submit request");
            }
        } catch (e) {
            Alert.alert("Error", "Server connection failed");
        }
    };

    return (
        <SafeAreaView style={[styles.safe, highContrast && { backgroundColor: "#000" }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <NavAuto />

            {/* Header Section */}
            <View style={[styles.header, highContrast && { backgroundColor: "#000", borderBottomColor: "#333" }]}>
                <Text style={[styles.title, highContrast && { color: "#FFF" }]}>Support Center</Text>
                <Text style={[styles.subtitle, highContrast && { color: "#CCC" }]}>We are here to help you</Text>
            </View>

            <ScrollView style={[styles.container, highContrast && { backgroundColor: "#000" }]} contentContainerStyle={styles.scrollContent}>

                {/* Call Support Card */}
                <View style={[styles.card, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: "#F59E0B15" }]}>
                            <Ionicons name="call" size={24} color="#F59E0B" />
                        </View>
                        <View style={styles.cardHeaderText}>
                            <Text style={[styles.cardTitle, highContrast && { color: "#FFF" }]}>Call Support</Text>
                            <Text style={[styles.cardSubtitle, highContrast && { color: "#CCC" }]}>Talk to our expert team</Text>
                        </View>
                    </View>
                    <View style={[styles.numberContainer, highContrast && { backgroundColor: "#222" }]}>
                        <Text style={[styles.tollFreeNumber, highContrast && { color: "#FFF" }]}>1800-123-4567</Text>
                        <Text style={[styles.tollFreeLabel, highContrast && { color: "#CCC" }]}>Toll-Free Number</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.callNowBtn}
                        onPress={() => handleCall("1800-123-4567")}
                    >
                        <Ionicons name="call-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.callNowText}>Call Now</Text>
                    </TouchableOpacity>
                </View>

                {/* Request Callback Section */}
                <View style={[styles.card, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: "#16A34A15" }]}>
                            <MaterialCommunityIcons name="message-text-clock" size={24} color="#16A34A" />
                        </View>
                        <View style={styles.cardHeaderText}>
                            <Text style={[styles.cardTitle, highContrast && { color: "#FFF" }]}>Request a Callback</Text>
                            <Text style={[styles.cardSubtitle, highContrast && { color: "#CCC" }]}>We will reach out to you</Text>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, highContrast && { color: "#CCC" }]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, highContrast && { backgroundColor: "#111", borderColor: "#333", color: "#FFF" }]}
                            placeholder="Enter your 10 digit mobile number"
                            placeholderTextColor="#94A3B8"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, highContrast && { color: "#CCC" }]}>Issue Type</Text>
                        <View style={[styles.pickerContainer, highContrast && { backgroundColor: "#111", borderColor: "#333" }]}>
                            <Picker
                                selectedValue={issueType}
                                onValueChange={(itemValue) => setIssueType(itemValue)}
                                style={[styles.picker, highContrast && { color: "#FFF" }]}
                            >
                                <Picker.Item label="Payment Issue" value="Payment" />
                                <Picker.Item label="Order Issue" value="Order Issue" />
                                <Picker.Item label="Delivery Issue" value="Delivery Issue" />
                                <Picker.Item label="Technical Problem" value="Technical Problem" />
                            </Picker>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.requestBtn} onPress={handleRequestCallback}>
                        <Text style={styles.requestBtnText}>Request Callback</Text>
                    </TouchableOpacity>
                </View>

                {/* Emergency Helpline */}
                <View style={[styles.card, styles.emergencyCard]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: "#DC262615" }]}>
                            <Ionicons name="alert-circle" size={24} color="#DC2626" />
                        </View>
                        <View style={styles.cardHeaderText}>
                            <Text style={[styles.cardTitle, { color: "#DC2626" }]}>Farmer Emergency Line</Text>
                            <Text style={styles.cardSubtitle}>Available 24/7 for urgencies</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.callNowBtn, { backgroundColor: "#DC2626" }]}
                        onPress={() => handleCall("1800-180-1551")}
                    >
                        <Ionicons name="call" size={20} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.callNowText}>Call Emergency Now</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
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
    title: { fontSize: 26, fontWeight: "900", color: "#0F172A", marginTop: 10 },
    subtitle: { fontSize: 16, color: "#64748B", marginTop: 4, fontWeight: "500" },

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

export default SupportScreen;
