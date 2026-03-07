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

export default function SetPinScreen() {
  const { t } = useTranslation();

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

  const onSave = async () => {
    setMsg("");
    if (!phone || !name) {
      setMsg("Required session details missing. Please restart.");
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

    router.replace({
      pathname: "/profile-setup",
      params: { phone, role, name, pin },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.root}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.brandHeader}>
            <Text style={styles.brandTitle}>
              <Text style={styles.brandGreen}>KISSAAN</Text> SAATHI
            </Text>
            <Text style={styles.brandTagline}>SECURITY CONFIGURATION</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>Create Access PIN</Text>
            <Text style={styles.instruction}>
              Establish a secure PIN to protect your account and transactions.
            </Text>

            <Text style={styles.label}>New PIN</Text>
            <TextInput
              style={styles.input}
              value={pin}
              onChangeText={(v) => setPin(v.replace(/\D/g, ""))}
              placeholder="••••"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              editable={!loading}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Verify PIN</Text>
            <TextInput
              style={styles.input}
              value={confirmPin}
              onChangeText={(v) => setConfirmPin(v.replace(/\D/g, ""))}
              placeholder="••••"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              editable={!loading}
            />

            {msg ? <Text style={styles.errorText}>{msg}</Text> : null}

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.btnDisabled]}
              onPress={onSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Secure Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  brandGreen: { color: "#10B981" },
  brandTagline: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 2,
    marginTop: 4,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  instruction: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
