import { Stack, useRouter, usePathname, useSegments } from "expo-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import VoiceNavButton from "../components/VoiceNavBtn"; // Disabled - requires native module build
import AccessibilityFab from "../components/accessibilityBtn";
import AccessibilitySheet from "../components/accessibilitySheet";
import { setLanguage as persistLanguage } from "../i18n/i18n";


export default function RootLayout() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLang] = useState(i18n.language || "en");

  // Authentication & Role Guard logic
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");

      const inAuthGroup = (segments[0] as any) === "(auth)" || pathname === "/login" || pathname === "/verify" || pathname === "/signin" || pathname === "/set-pin";

      if (!token && !inAuthGroup) {
        // Redirect to login if not authenticated
        setTimeout(() => router.replace("/login"), 0);
      } else if (token && role) {
        // Role based dashboard redirection if on home/index or wrong dashboard
        if (pathname === "/" || pathname === "/index") {
          setTimeout(() => router.replace(role === "farmer" ? "/farmer-dashboard" : "/buyer-dashboard"), 0);
        }

        if (role === "buyer") {
          const farmerOnly = ["/farmer-dashboard", "/invoices", "/govt-schemes"];
          if (farmerOnly.some(p => pathname.startsWith(p))) setTimeout(() => router.replace("/buyer-dashboard"), 0);
        }
        if (role === "farmer") {
          const buyerOnly = ["/buyer-dashboard"];
          if (buyerOnly.some(p => pathname.startsWith(p))) setTimeout(() => router.replace("/farmer-dashboard"), 0);
        }

        // Excluded features guard (Epic 6, Inventory Add/Edit)
        const excluded = ["/live-auctions", "/my-listings", "/add-crop", "/add-listing", "/my-bids", "/browse-crops"];
        if (excluded.some(p => pathname.startsWith(p))) {
          setTimeout(() => router.replace("/not-available"), 0);
        }
      }
    };

    checkAuth();
  }, [segments, pathname]);

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
