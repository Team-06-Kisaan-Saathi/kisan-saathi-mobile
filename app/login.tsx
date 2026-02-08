import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// TIP: Keep HOST in one place. If you change Wi-Fi / backend machine, this must change too.
const HOST = "10.12.252.131";
const API_BASE = `http://${HOST}:5001/api`; // base
const AUTH_API = `${API_BASE}/auth`; // your auth base

export default function LoginScreen() {
  const { t } = useTranslation();

  const [phone, setPhone] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>("");

  const url = useMemo(() => `${AUTH_API}/login`, []);

  const handleLogin = async (): Promise<void> => {
    setMsg("");

    const trimmedPhone = phone.trim();
    const trimmedPin = pin.trim();

    // ✅ validation
    if (!/^\d{10}$/.test(trimmedPhone)) {
      setMsg(t("auth.invalid_phone") || "Invalid phone number");
      return;
    }

    if (!/^\d{4,6}$/.test(trimmedPin)) {
      setMsg("PIN must be 4 to 6 digits");
      return;
    }

    const body = {
      phone: trimmedPhone,
      pin: trimmedPin,
    };

    try {
      setLoading(true);

      const res = await axios.post(url, body, {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });

      // ✅ success detection (backend-agnostic)
      const ok =
        res.data?.success === true ||
        res.data?.status === "SUCCESS" ||
        res.data?.status === "success";

      if (!ok) {
        setMsg(res.data?.message || t("auth.login_failed") || "Login failed");
        return;
      }

      // ✅ SAVE TOKEN (this fixes your mandi 401)
      const token =
        res.data?.token || res.data?.accessToken || res.data?.data?.token;

      if (!token) {
        setMsg("Login succeeded but token missing in response");
        return;
      }

      await AsyncStorage.setItem("token", String(token));

      // ✅ user + role
      const user = res.data?.user || res.data?.data?.user;

      if (!user) {
        setMsg("Login succeeded but user data missing in response");
        return;
      }

      // ✅ routing
      if (user.role === "farmer") {
        router.replace("/farmer-dashboard");
      } else {
        router.replace("/buyer-dashboard");
      }
    } catch (err: any) {
      if (err?.response) {
        console.log("❌ LOGIN status:", err?.response?.status);
        console.log("❌ LOGIN data:", err?.response?.data);
        setMsg(err.response.data?.message || "Invalid credentials");
      } else if (err?.code === "ECONNABORTED") {
        setMsg("Request timed out. Check Wi-Fi / backend IP.");
      } else {
        setMsg("Network error. Check backend is running and reachable.");
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

        <View style={styles.wrapper}>
          <View style={styles.brand}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.appName}>
              <Text style={styles.green}>KISSAAN</Text>{" "}
              <Text style={styles.blue}>SAATHI</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.welcomeMsg}>{t("auth.welcome")}</Text>

            <Text style={styles.label}>{t("auth.enter_phone")}</Text>

            <View style={styles.phoneInput}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneTextInput}
                placeholder={t("auth.phone_placeholder")}
                placeholderTextColor="#777"
                keyboardType="number-pad"
                value={phone}
                maxLength={10}
                onChangeText={(v) => setPhone(v.replace(/\D/g, ""))}
              />
            </View>

            <Text style={[styles.label, { marginTop: 16, marginBottom: 8 }]}>
              Enter PIN
            </Text>

            <View style={styles.phoneInput}>
              <TextInput
                style={styles.phoneTextInput}
                placeholder="****"
                placeholderTextColor="#777"
                keyboardType="number-pad"
                value={pin}
                maxLength={6}
                secureTextEntry
                onChangeText={(v) => setPin(v.replace(/\D/g, ""))}
              />
            </View>

            {msg ? <Text style={styles.errorMsg}>{msg}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.buttonText}> Logging In...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>{t("auth.continue")}</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.signup}>
              {t("auth.no_account")}{" "}
              <Text
                style={styles.createNew}
                onPress={() => router.push("/signin")}
              >
                {t("auth.create_new")}
              </Text>
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  bg: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,248,235,0.55)",
  },

  wrapper: {
    width: "100%",
    maxWidth: 380,
    paddingHorizontal: 24,
    paddingTop: 32,
    zIndex: 2,
    alignItems: "center",
  },

  brand: { alignItems: "center" },

  logo: {
    width: 70,
    height: 70,
    marginBottom: 64,
  },

  appName: {
    fontSize: 32,
    fontFamily: "Times New Roman",
    textAlign: "center",
  },

  green: { color: "green" },
  blue: { color: "rgb(37,95,153)" },

  form: {
    width: "100%",
    marginTop: 24,
  },

  welcomeMsg: {
    color: "green",
    fontSize: 20,
    marginBottom: 48,
    textAlign: "center",
  },

  label: { fontSize: 14, marginBottom: 8 },

  phoneInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 30,
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 14,
    minHeight: 42,
  },

  countryCode: {
    marginRight: 10,
    fontWeight: "600",
    color: "#333",
    fontSize: 16,
  },

  phoneTextInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },

  errorMsg: {
    color: "#b00020",
    marginBottom: 10,
    fontSize: 13,
  },

  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "rgb(37,95,153)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  buttonDisabled: { opacity: 0.75 },

  buttonText: {
    color: "#fff",
    fontSize: 16,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  signup: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
  },

  createNew: {
    color: "green",
    textDecorationLine: "underline",
  },
});
