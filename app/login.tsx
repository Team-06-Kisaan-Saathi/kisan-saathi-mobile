import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

const API = "http://localhost:5001/api/auth";

type SendOtpResponse = {
  success?: boolean;
  message?: string;
};

export default function LoginScreen() {
  const { t } = useTranslation();

  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>("");

  const handleContinue = async (): Promise<void> => {
    setMsg("");

    const trimmed = phone.trim();

    // ✅ validate Indian 10-digit mobile
    if (!/^\d{10}$/.test(trimmed)) {
      setMsg(t("auth.invalid_phone"));
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post<SendOtpResponse>(
        `${API}/send-otp`,
        { phone: trimmed },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data?.success) {
        // Navigate to farmer dashboard (temporary for testing)
        router.push("/farmer-dashboard");
        // TODO: Add role selection and OTP verification later
        // router.push({ pathname: "/verify", params: { phone: trimmed } });
      } else {
        setMsg(res.data?.message || t("auth.otp_send_failed"));
      }
    } catch (err: unknown) {
      // Optional: show backend message if present
      const e = err as any;
      setMsg(e?.response?.data?.message || e?.message || t("auth.login_failed"));
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

            <Text style={styles.hint}>{t("auth.otp_hint")}</Text>

            {msg ? <Text style={styles.errorMsg}>{msg}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator />
                  <Text style={styles.buttonText}> {t("auth.sending_otp")}</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>{t("auth.continue")}</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.signup}>
              {t("auth.no_account")}{" "}
              <Text
                style={styles.createNew}
              //onPress={() => router.push("/signin")}
              >
                {t("auth.create_new")}
              </Text>
            </Text>

            {/* TEMPORARY TESTING LINK */}
            <TouchableOpacity
              style={styles.devButton}
              onPress={() => router.push("/farmer-dashboard")}
            >
              <Text style={styles.devButtonText}>Go to Farmer Dashboard</Text>
            </TouchableOpacity>

            


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

  hint: {
    fontSize: 12,
    color: "#555",
    marginTop: 10,
    marginBottom: 14,
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
