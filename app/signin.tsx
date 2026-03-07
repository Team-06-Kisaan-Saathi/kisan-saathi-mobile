import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { apiFetch } from "../services/http";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ENDPOINTS } from "../services/api";

type Role = "farmer" | "buyer";

export default function SigninScreen() {
  const { t } = useTranslation();

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<Role | "">("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const roles = useMemo(
    () => [
      { label: "Farmer / Producer", value: "farmer" as Role },
      { label: "Buyer / Trader", value: "buyer" as Role },
    ],
    [],
  );

  const onContinue = async () => {
    setMsg("");
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !role || !/^\d{10}$/.test(trimmedPhone)) {
      setMsg("Please provide all details correctly");
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch<any>(ENDPOINTS.AUTH.SEND_OTP, {
        method: "POST",
        body: JSON.stringify({ phone: trimmedPhone }),
      });

      if (res?.success) {
        if (res.otp) {
          console.log("SIMULATED_OTP:", res.otp);
          Alert.alert("Simulated OTP", `Your verification code is: ${res.otp}`);
        }
        router.push({
          pathname: "/verify",
          params: { phone: trimmedPhone, name: trimmedName, role },
        });
      } else {
        setMsg(res?.message || "Failed to send OTP");
      }
    } catch (err: any) {
      console.error("SIGNIN_ERROR:", err.message);
      setMsg(err.message || "Connection error. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("../assets/images/f.jpg")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.brandContainer}>
              <Text style={styles.brandName}>
                <Text style={styles.brandGreen}>KISSAAN</Text>{" "}
                <Text style={styles.brandBlue}>SAATHI</Text>
              </Text>
              <Text style={styles.tagline}>CREATE NEW ACCOUNT</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Registration</Text>

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Rajesh Kumar"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />

              <Text style={styles.label}>Primary Role</Text>
              <Pressable
                onPress={() => setRoleOpen(!roleOpen)}
                style={[styles.dropdownHeader, roleOpen && styles.dropdownHeaderActive]}
              >
                <Text style={[styles.dropdownText, !role && { color: "#94A3B8" }]}>
                  {role ? roles.find(r => r.value === role)?.label : "Select your role"}
                </Text>
                <Ionicons name={roleOpen ? "chevron-up" : "chevron-down"} size={14} color="#64748B" />
              </Pressable>

              {roleOpen && (
                <View style={styles.dropdownBody}>
                  {roles.map((r) => (
                    <Pressable
                      key={r.value}
                      onPress={() => { setRole(r.value); setRoleOpen(false); }}
                      style={[styles.dropdownRow, role === r.value && styles.dropdownRowActive]}
                    >
                      <Text style={[styles.dropdownRowText, role === r.value && styles.dropdownRowTextActive]}>
                        {r.label}
                      </Text>
                      {role === r.value && <Ionicons name="checkmark" size={16} color="#2563EB" />}
                    </Pressable>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.phoneRow}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  value={phone}
                  onChangeText={(v) => setPhone(v.replace(/\D/g, ""))}
                  placeholder="10-digit number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={10}
                  style={styles.phoneInput}
                />
              </View>

              {msg ? <Text style={styles.errorMsg}>{msg}</Text> : null}

              <TouchableOpacity
                style={[styles.btnPrimary, loading && styles.btnDisabled]}
                onPress={onContinue}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Proceed to Verify</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>{t("signup.already_account")}</Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.linkText}>{t("signup.login")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bg: { flex: 1, width: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  kav: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  brandGreen: { color: "#10B981" },
  brandBlue: { color: "#FFFFFF" },
  tagline: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 4,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 8 },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 6,
    marginTop: 16,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: "#F8FAFC",
  },
  dropdownHeaderActive: {
    borderColor: "#2563EB",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  dropdownBody: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#2563EB",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownRowActive: {
    backgroundColor: "#EFF6FF",
  },
  dropdownRowText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  dropdownRowTextActive: {
    color: "#2563EB",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: "#F8FAFC",
  },
  countryCode: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  errorMsg: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  btnPrimary: {
    backgroundColor: "#2563EB",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  linkText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "800",
  },
});
