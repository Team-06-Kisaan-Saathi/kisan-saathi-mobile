import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type SignupCompleteResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  user?: { role?: string };
};

const HOST = "10.104.34.251";
const AUTH_API = `http://${HOST}:5001/api/auth`;

export default function SetPinScreen() {
  const { t } = useTranslation();

  // ✅ Receive phone, name, role from VerifyScreen
  const params = useLocalSearchParams<{
    phone?: string;
    name?: string;
    role?: string;
  }>();

  const phone = String(params.phone ?? "");
  const name = String(params.name ?? "");
  const role = String(params.role ?? "farmer");

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const safeJson = (raw: string) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const onSave = async () => {
    setMsg("");

    if (!phone) {
      setMsg("Missing phone number. Go back and try again.");
      return;
    }
    if (!name) {
      setMsg("Missing name. Go back and try again.");
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setMsg("PIN must be 4 to 6 digits");
      return;
    }
    if (pin !== confirmPin) {
      setMsg("PINs do not match");
      return;
    }

    // Pass data to next screen instead of saving here
    router.replace({
      pathname: "/profile-setup",
      params: { phone, role, name, pin },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Set Your PIN</Text>
            <Text style={styles.subtitle}>Secure your account with a PIN.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Enter PIN</Text>
            <TextInput
              style={styles.input}
              value={pin}
              onChangeText={(v) => setPin(v.replace(/\D/g, ""))}
              placeholder="****"
              placeholderTextColor="#ccc"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              editable={!loading}
            />

            <Text style={styles.label}>Confirm PIN</Text>
            <TextInput
              style={styles.input}
              value={confirmPin}
              onChangeText={(v) => setConfirmPin(v.replace(/\D/g, ""))}
              placeholder="****"
              placeholderTextColor="#ccc"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              editable={!loading}
            />

            {msg ? <Text style={styles.errorMsg}>{msg}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={onSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save PIN</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fbf6ec" },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "green",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    backgroundColor: "#fafafa",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 4,
    color: "#000",
  },
  errorMsg: {
    color: "#e00",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 13,
  },
  button: {
    backgroundColor: "rgb(37,95,153)",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
