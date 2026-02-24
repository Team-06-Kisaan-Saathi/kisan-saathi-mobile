import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile, updateProfile } from "../services/userServices";

export default function EditProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [language, setLanguage] = useState("English");
    const [role, setRole] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getProfile();
            if (res?.success) {
                setName(res.user.name || "");
                setLanguage(res.user.language || "English");
                setRole(res.user.role || "farmer");
            }
        } catch (e) {
            console.log("EditProfile error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Name cannot be empty.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await updateProfile({ name, language });
            if (res?.success) {
                Alert.alert("Success", "Profile updated successfully.");
                router.back();
            } else {
                Alert.alert("Error", res?.message || "Update failed.");
            }
        } catch (e) {
            Alert.alert("Error", "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <Stack.Screen options={{ title: "Edit Profile", headerShadowVisible: false }} />
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{name.charAt(0) || "U"}</Text>
                    </View>
                    <Text style={styles.roleText}>{role.toUpperCase()}</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Preferred Language</Text>
                        <View style={styles.langRow}>
                            {["English", "Hindi", "Punjabi"].map(l => (
                                <TouchableOpacity
                                    key={l}
                                    style={[styles.langBtn, language === l && styles.langBtnActive]}
                                    onPress={() => setLanguage(l)}
                                >
                                    <Text style={[styles.langText, language === l && styles.langTextActive]}>{l}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.verifyLink}
                        onPress={() => router.push("/verification")}
                    >
                        <Ionicons name="shield-checkmark" size={20} color="#1d4ed8" />
                        <Text style={styles.verifyLinkText}>Manage Identity Verification</Text>
                        <Ionicons name="chevron-forward" size={16} color="#64748B" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={submitting}
                    >
                        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    scroll: { padding: 24 },
    header: { alignItems: "center", marginBottom: 32 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#1e3a8a", alignItems: "center", justifyContent: "center", marginBottom: 12 },
    avatarText: { color: "#fff", fontSize: 32, fontWeight: "800" },
    roleText: { fontSize: 13, fontWeight: "800", color: "#64748B", letterSpacing: 1 },
    form: { gap: 24 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: "700", color: "#475569" },
    input: { height: 50, backgroundColor: "#F1F5F9", borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: "#1E293B", borderWidth: 1, borderColor: "#E2E8F0" },
    langRow: { flexDirection: "row", gap: 8 },
    langBtn: { flex: 1, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0" },
    langBtnActive: { backgroundColor: "#1e3a8a", borderColor: "#1e3a8a" },
    langText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
    langTextActive: { color: "#fff" },
    verifyLink: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#EEF2FF", borderRadius: 12, gap: 12, marginTop: 10 },
    verifyLinkText: { flex: 1, fontSize: 15, fontWeight: "700", color: "#1d4ed8" },
    saveBtn: { height: 54, backgroundColor: "#1D4ED8", borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 20 },
    saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
