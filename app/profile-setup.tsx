// app/profile-setup.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const LANGS = [
  { label: "English", value: "en" },
  { label: "മലയാളം", value: "ml" },
  { label: "தமிழ்", value: "ta" },
  { label: "తెలుగు", value: "te" },
  { label: "हिंदी", value: "hi" },
];

export default function ProfileSetup() {
  const params = useLocalSearchParams<{
    phone?: string;
    name?: string;
    role?: string;
    pin?: string;
  }>();
  const phone = String(params.phone ?? "");
  const name = String(params.name ?? "");
  const role = String(params.role ?? "");
  const pin = String(params.pin ?? "");

  const [lang, setLang] = useState<string>("en");
  const [loading, setLoading] = useState(false);

  const canContinue = useMemo(() => !!lang && !loading, [lang, loading]);

  const next = async () => {
    // Pass data to next screen
    router.replace({
      pathname: "/profile-location",
      params: { phone, name, role, pin, lang },
    });
  };

  return (
    <View style={s.root}>
      <View style={s.content}>
        <View style={s.header}>
          <Text style={s.step}>Step 1 of 2</Text>
          <Text style={s.title}>Select your language</Text>
          <Text style={s.header}>
            Choose the language you want to use in the app
          </Text>
        </View>

        <View style={s.options}>
          {LANGS.map((l) => {
            const active = lang === l.value;
            return (
              <Pressable
                key={l.value}
                onPress={() => setLang(l.value)}
                style={({ pressed }) => [
                  s.option,
                  active && s.optionActive,
                  pressed && s.optionPressed,
                ]}
              >
                <Text style={[s.optionText, active && s.optionTextActive]}>
                  {l.label}
                </Text>
                {active && <View style={s.check}>✓</View>}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={next}
          disabled={!canContinue}
          style={({ pressed }) => [
            s.button,
            !canContinue && s.buttonDisabled,
            pressed && canContinue && s.buttonPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={s.buttonText}>Continue</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  step: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  optionActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
  },
  optionTextActive: {
    color: "#1D4ED8",
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  button: {
    marginTop: "auto",
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
