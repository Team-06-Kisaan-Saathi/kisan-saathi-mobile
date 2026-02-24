import { Stack } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

// import VoiceNavButton from "../components/VoiceNavBtn"; // Disabled - requires native module build
import AccessibilityFab from "../components/accessibilityBtn";
import AccessibilitySheet from "../components/accessibilitySheet";
import { setLanguage as persistLanguage } from "../i18n/i18n";


export default function RootLayout() {
  const { i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLang] = useState(i18n.language || "en");

  const setLanguage = async (lang: string) => {
    setLang(lang);
    await persistLanguage(lang);
  };

  return (
    <View style={styles.root}>
      {/* Screens */}
      <Stack
        initialRouteName="login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="marketplace" />
      </Stack>

      {/* ✅ Floating overlay ABOVE everything */}
      <View pointerEvents="box-none" style={styles.overlay}>
        <AccessibilityFab onPress={() => setOpen(true)} />
        {/* <VoiceNavButton /> */} {/* Disabled - requires native module build */}
      </View>

      {/* Sheet */}
      <AccessibilitySheet
        visible={open}
        onClose={() => setOpen(false)}
        fontScale={fontScale}
        setFontScale={setFontScale}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        language={language}
        setLanguage={setLanguage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
    elevation: 999999,
  },
});
