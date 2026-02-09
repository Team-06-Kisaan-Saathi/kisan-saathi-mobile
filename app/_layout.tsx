import { Stack } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

// import VoiceNavButton from "../components/VoiceNavBtn"; // Disabled - requires native module build
import AccessibilityFab from "../components/accessibilityBtn";
import AccessibilitySheet from "../components/accessibilitySheet";
import "../i18n/i18n";
import { setLanguage as persistLanguage } from "../i18n/i18n";

export default function RootLayout() {
  const { i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [language, setLang] = useState(i18n.language || "en");

  const setLanguage = async (lang: string) => {
    setLang(lang);
    await persistLanguage(lang);
  };

  return (
    <AccessibilityProvider>
      <View style={styles.root}>
        <Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="verify" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="marketplace" />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>

        {/* Floating overlay */}
        <View pointerEvents="box-none" style={styles.overlay}>
          <AccessibilityFab onPress={() => setOpen(true)} />
          <VoiceNavButton />
        </View>

        <AccessibilitySheet
          visible={open}
          onClose={() => setOpen(false)}
          language={language}
          setLanguage={setLanguage}
        />
      </View>
    </AccessibilityProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    position: "absolute",
    right: 16,
    bottom: 24,
  },
});
