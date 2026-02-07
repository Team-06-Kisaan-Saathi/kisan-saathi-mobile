import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";

export default function SigninScreen() {
  const { t } = useTranslation();

  // UI-only state (no signup yet)
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const onContinue = () => {
    // UI only:
    router.push("/verify");
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
          style={styles.wrapper}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Text style={styles.title}>{t("signup.create_account")}</Text>
          <Text style={styles.subtitle}>{t("signup.signin_subtitle")}</Text>

          <Text style={styles.label}>{t("signup.name_label")}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t("signup.name_placeholder")}
            placeholderTextColor="#777"
            style={styles.input}
          />

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

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.9}
            onPress={onContinue}
          >
            <Text style={styles.buttonText}>{t("signup.continue")}</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            {t("signup.already_account")}{" "}
            <Text style={styles.link} onPress={() => router.push("/login")}>
              {t("signup.login")}
            </Text>
          </Text>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  bg: { flex: 1, width: "100%", alignItems: "center" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,248,235,0.55)",
  },
  wrapper: {
    width: "100%",
    maxWidth: 380,
    paddingHorizontal: 24,
    paddingTop: 40,
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#444",
    textAlign: "center",
    marginBottom: 24,
  },
  label: { fontSize: 14, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    fontSize: 16,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 30,
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 14,
    minHeight: 42,
    marginBottom: 18,
  },
  countryCode: {
    marginRight: 10,
    fontWeight: "600",
    color: "#333",
    fontSize: 16,
  },
  phoneInput: { flex: 1, fontSize: 16, paddingVertical: 4 },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "rgb(37,95,153)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    marginTop: 6,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: { marginTop: 16, fontSize: 14, textAlign: "center" },
  link: { color: "green", textDecorationLine: "underline" },
});
