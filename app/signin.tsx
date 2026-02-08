import axios from "axios";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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

// ✅ TIP: Keep HOST in one place
const HOST = "10.12.252.131";
const API_BASE = `http://${HOST}:5001/api`;
const AUTH_API = `${API_BASE}/auth`;

type Role = "farmer" | "buyer";

export default function SigninScreen() {
  const { t } = useTranslation();

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // ✅ role dropdown
  const [role, setRole] = useState<Role | "">("");
  const [roleOpen, setRoleOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const roles = useMemo(
    () => [
      { label: "Farmer", value: "farmer" as Role },
      { label: "Buyer", value: "buyer" as Role },
    ],
    [],
  );

  const onContinue = async () => {
    setMsg("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setMsg("Please enter your name");
      return;
    }
    if (!role) {
      setMsg("Please select your role");
      return;
    }
    if (!/^\d{10}$/.test(trimmedPhone)) {
      setMsg(t("auth.invalid_phone") || "Invalid phone number");
      return;
    }

    try {
      setLoading(true);

      const url = `${AUTH_API}/send-otp`;
      const body = { phone: trimmedPhone };

      console.log("HITTING:", url);
      console.log("SEND OTP BODY:", body);

      const res = await axios.post(url, body, {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });

      console.log("SEND OTP RESPONSE:", res.data);

      const ok = res.data?.success === true;
      if (!ok) {
        setMsg(res.data?.message || "Failed to send OTP");
        return;
      }

      // ✅ send role too
      router.push({
        pathname: "/verify",
        params: { phone: trimmedPhone, name: trimmedName, role },
      });
    } catch (err: any) {
      console.log("Send OTP Error:", err?.message);
      console.log("Send OTP Error Response:", err?.response?.data);

      if (err?.response) {
        setMsg(err.response.data?.message || "Could not send OTP");
      } else if (err?.code === "ECONNABORTED") {
        setMsg("Request timed out. Check Wi-Fi / backend IP.");
      } else {
        setMsg("Network error. Check backend is running.");
      }
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
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Text style={styles.title}>{t("signup.create_account")}</Text>
              <Text style={styles.subtitle}>{t("signup.signin_subtitle")}</Text>

              {/* Name */}
              <Text style={styles.label}>{t("signup.name_label")}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t("signup.name_placeholder")}
                placeholderTextColor="#777"
                style={styles.input}
              />

              {/* Role dropdown */}
              <Text style={styles.label}>Role</Text>

              <Pressable
                onPress={() => setRoleOpen((v) => !v)}
                style={({ pressed }) => [
                  styles.dropdownHeader,
                  pressed && styles.pressed,
                  roleOpen && styles.dropdownHeaderOpen,
                ]}
              >
                <Text style={styles.dropdownHeaderText}>
                  {role
                    ? roles.find((r) => r.value === role)?.label
                    : "Select Farmer / Buyer"}
                </Text>
                <Text style={styles.chev}>{roleOpen ? "▲" : "▼"}</Text>
              </Pressable>

              {roleOpen && (
                <View style={styles.dropdownBody}>
                  {roles.map((r) => (
                    <Pressable
                      key={r.value}
                      onPress={() => {
                        setRole(r.value);
                        setRoleOpen(false);
                      }}
                      style={({ pressed }) => [
                        styles.dropdownRow,
                        pressed && styles.pressed,
                        role === r.value && styles.dropdownRowActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownRowText,
                          role === r.value && styles.dropdownRowTextActive,
                        ]}
                      >
                        {r.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Phone */}
              <Text style={styles.label}>{t("signup.phone_label")}</Text>
              <View style={styles.phoneRow}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  value={phone}
                  onChangeText={(v) => setPhone(v.replace(/\D/g, ""))}
                  placeholder={t("signup.phone_placeholder")}
                  placeholderTextColor="#777"
                  keyboardType="number-pad"
                  maxLength={10}
                  style={styles.phoneInput}
                />
              </View>

              {msg ? <Text style={styles.errorMsg}>{msg}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                activeOpacity={0.9}
                onPress={onContinue}
                disabled={loading}
              >
                {loading ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.buttonText}> Sending OTP...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>{t("signup.continue")}</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.footer}>
                {t("signup.already_account")}{" "}
                <Text style={styles.link} onPress={() => router.push("/login")}>
                  {t("signup.login")}
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  bg: { flex: 1, width: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,248,235,0.55)",
  },

  kav: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 40,
    alignItems: "center",
  },

  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
    color: "#111",
  },
  subtitle: {
    fontSize: 13,
    color: "#444",
    textAlign: "center",
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.16)",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },

  // Dropdown
  dropdownHeader: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.16)",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownHeaderText: { fontSize: 16, color: "#111", fontWeight: "600" },
  chev: { fontSize: 12, color: "#555", fontWeight: "900" },

  dropdownBody: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "rgba(0,0,0,0.16)",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: "hidden",
  },
  dropdownRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  dropdownRowActive: { backgroundColor: "rgba(37,95,153,0.10)" },
  dropdownRowText: { fontSize: 15, color: "#111", fontWeight: "600" },
  dropdownRowTextActive: { color: "rgb(37,95,153)" },

  pressed: { opacity: 0.7 },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.16)",
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  countryCode: {
    marginRight: 10,
    fontWeight: "800",
    color: "#333",
    fontSize: 16,
  },
  phoneInput: { flex: 1, fontSize: 16, paddingVertical: 2 },

  errorMsg: {
    color: "#b00020",
    marginTop: 12,
    marginBottom: 2,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },

  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "rgb(37,95,153)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.75 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  footer: { marginTop: 14, fontSize: 14, textAlign: "center", color: "#111" },
  link: { color: "green", textDecorationLine: "underline", fontWeight: "700" },
});
