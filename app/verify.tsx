import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";

type VerifyOtpResponse = {
  success?: boolean;
  message?: string;
  token?: string;
};

const API = "http://10.125.64.251:5001/api/auth";

export default function VerifyScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = String(params.phone ?? ""); // always string

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const inputs = useRef<Array<TextInput | null>>([]);

  const otp = useMemo(() => digits.join(""), [digits]);
  const canSubmit = otp.length === 6 && !digits.includes("");

  useEffect(() => {
    const id = setTimeout(() => inputs.current[0]?.focus(), 80);
    return () => clearTimeout(id);
  }, []);

  // small helper: safe JSON parse
  const safeJson = (raw: string) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const setDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });

    // move focus forward
    if (v && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // auto-verify when last digit entered
    if (v && index === 5) {
      setTimeout(() => verify(), 80);
    }
  };

  const onKeyPress = (index: number, key: string) => {
    if (key === "Backspace") {
      setDigits((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = "";
        } else if (index > 0) {
          next[index - 1] = "";
          setTimeout(() => inputs.current[index - 1]?.focus(), 0);
        }
        return next;
      });
    }
  };

  const verify = async () => {
    setMsg("");

    if (!canSubmit) {
      setMsg(t("auth.invalid_otp"));
      return;
    }

    try {
      setLoading(true);

      const url = `${API}/verify-otp`;
      const body = { phone: String(phone), otp: String(otp) };

      // debug logs
      console.log("➡️ VERIFY URL:", url);
      console.log("➡️ VERIFY BODY:", JSON.stringify(body));

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("✅ VERIFY STATUS:", res.status);

      const raw = await res.text();
      console.log("✅ VERIFY RAW:", raw);

      const parsed = safeJson(raw) as VerifyOtpResponse | null;

      if (!parsed) {
        setMsg("Server returned invalid JSON.");
        return;
      }

      if (parsed.success) {
        // if you want to store token:
        // if (parsed.token) await AsyncStorage.setItem("token", parsed.token);
        router.replace("./marketplace");
      } else {
        setMsg(parsed.message || t("auth.otp_verify_failed"));
      }
    } catch (e: any) {
      console.log(" VERIFY ERROR:", e);
      setMsg(e?.message || t("auth.otp_verify_failed"));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setMsg("");
    setDigits(["", "", "", "", "", ""]);
    setTimeout(() => inputs.current[0]?.focus(), 80);

    try {
      setLoading(true);

      const url = `${API}/send-otp`;
      const body = { phone: String(phone) };

      console.log("➡️ RESEND URL:", url);
      console.log("➡️ RESEND BODY:", JSON.stringify(body));

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("RESEND STATUS:", res.status);
      const raw = await res.text();
      console.log("RESEND RAW:", raw);

      setMsg(t("auth.otp_resent"));
    } catch (e: any) {
      console.log("RESEND ERROR:", e);
      setMsg(e?.message || t("auth.otp_send_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Centered content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("auth.verify_title")}</Text>
            <Text style={styles.subtitle}>
              {t("auth.sent_code")}{" "}
              <Text style={styles.phoneText}>{phone ? `+91 ${phone}` : ""}</Text>
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("auth.enter_otp")}</Text>

            <View style={styles.otpRow}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <TextInput
                  key={i}
                  ref={(r) => {
                    inputs.current[i] = r;
                  }}
                  style={[
                    styles.otpBox,
                    digits[i] ? styles.otpBoxFilled : null,
                  ]}
                  value={digits[i]}
                  onChangeText={(v) => setDigit(i, v)}
                  onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  returnKeyType={i === 5 ? "done" : "next"}
                  textAlign="center"
                  selectionColor="#1f5fa6"
                  editable={!loading}
                />
              ))}
            </View>

            {msg ? <Text style={styles.msg}>{msg}</Text> : null}

            <Pressable
              onPress={verify}
              disabled={!canSubmit || loading}
              style={({ pressed }) => [
                styles.primaryBtn,
                (!canSubmit || loading) && styles.primaryBtnDisabled,
                pressed && canSubmit && !loading && { opacity: 0.9 },
              ]}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.primaryBtnText}>
                    {" "}
                    {t("auth.verifying")}
                  </Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>{t("auth.verify")}</Text>
              )}
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>{t("auth.didnt_get_code")}</Text>
              <Pressable onPress={resend} disabled={loading}>
                <Text style={[styles.link, loading && { opacity: 0.6 }]}>
                  {t("auth.resend")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fbf6ec",
    paddingHorizontal: 18,
  },

  // centers header + card in the page
  content: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },

  header: {
    marginBottom: 14,
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "green",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    textAlign: "center",
  },
  phoneText: { fontWeight: "700", color: "#1f5fa6" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 14,
    textAlign: "center",
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d8d8d8",
    backgroundColor: "#fafafa",
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  otpBoxFilled: {
    borderColor: "#1f5fa6",
    backgroundColor: "#ffffff",
  },

  msg: {
    marginTop: 4,
    marginBottom: 10,
    color: "#b00020",
    fontSize: 13,
    textAlign: "center",
  },

  primaryBtn: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#1f5fa6",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: { opacity: 0.65 },

  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  footerText: { color: "#444", fontSize: 13 },
  link: { color: "green", fontWeight: "800", fontSize: 13 },
});
