import { Stack } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AccessibilityFab from "../components/accessibilityBtn";
import AccessibilitySheet from "../components/accessibilitySheet";
import VoiceNavButton from "../components/VoiceNavBtn";
import "../i18n/i18n";
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
    <>
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="verify" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="marketplace" options={{ headerShown: false }} />
        {/* add more screens here */}
      </Stack>

      <AccessibilityFab onPress={() => setOpen(true)} />
      <VoiceNavButton />

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
    </>
  );
}
