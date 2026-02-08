import axios from "axios";
import { router } from "expo-router";
import React, { useState } from "react";
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

const HOST = "10.12.252.131";
const API = `http://${HOST}:5001/api/auth`;

console.log("API CONST =", API);

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

    if (!/^\d{10}$/.test(trimmed)) {
      setMsg(t("auth.invalid_phone"));
      return;
    }

    const url = `${API}/send-otp`;
    const body = { phone: trimmed };

    console.log("➡️ SEND OTP URL:", url);
    console.log("➡️ SEND OTP BODY:", body);

    try {
      setLoading(true);

      const res = await axios.post(url, body, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      console.log("STATUS:", res.status);
      console.log("DATA:", res.data);

      if (res.data?.success) {
        router.push({ pathname: "/verify", params: { phone: trimmed } });
      } else {
        setMsg(res.data?.message || t("auth.otp_send_failed"));
      }
    } catch (err: any) {
      console.log("❌ AXIOS ERROR MESSAGE:", err?.message);

      if (err?.response) {
        console.log("❌ STATUS:", err.response.status);
        console.log("❌ DATA:", err.response.data);
        console.log("❌ HEADERS:", err.response.headers);

        setMsg(
          err.response.data?.message ||
            `HTTP ${err.response.status}: request failed`,
        );
      } else if (err?.request) {
        console.log("❌ NO RESPONSE. REQUEST:", err.request);
        setMsg("No response from server (network / IP / firewall issue).");
      } else {
        console.log("❌ UNKNOWN ERROR:", err);
        setMsg(err?.message || "Unknown error");
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
                  <Text style={styles.buttonText}>
                    {" "}
                    {t("auth.sending_otp")}
                  </Text>
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
