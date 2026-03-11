import { Stack, useRouter, usePathname, useSegments } from "expo-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import VoiceNavButton from "../components/VoiceNavBtn";
import AccessibilityFab from "../components/accessibilityBtn";
import AccessibilitySheet from "../components/accessibilitySheet";
import { notificationService } from "../services/NotificationService";
import { setLanguage as persistLanguage } from "../i18n/i18n";
import { ThemeProvider, useTheme } from "../hooks/ThemeContext";
import { Colors } from "../constants/theme";

import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <InnerLayoutWrapper />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function InnerLayoutWrapper() {
  const { i18n } = useTranslation();
  const { highContrast, fontScale, zoomEnabled } = useTheme();
  const [language, setLang] = useState(i18n.language || "en");

  const setLanguage = async (lang: string) => {
    setLang(lang);
    await persistLanguage(lang);
  };

  return (
    <InnerLayout
      isHighContrast={highContrast}
      fontScale={fontScale}
      zoomEnabled={zoomEnabled}
      language={language}
      setLanguage={setLanguage}
    />
  );
}

function InnerLayout({ isHighContrast, fontScale, zoomEnabled, language, setLanguage }: any) {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useTheme();
  const highContrast = isHighContrast;

  const [open, setOpen] = useState(false);

  const isAuthPage = (segments[0] as any) === "(auth)" ||
    pathname === "/login" ||
    pathname === "/verify" ||
    pathname === "/signin" ||
    pathname === "/verification" ||
    pathname === "/set-pin" ||
    pathname === "/profile-setup" ||
    pathname === "/profile-location";

  // Zoom logic
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .enabled(zoomEnabled)
    .onUpdate((e) => {
      let newScale = savedScale.value * e.scale;
      if (newScale > 3) newScale = 3;
      if (newScale < 0.5) newScale = 0.5;
      scale.value = newScale;
    })
    .onEnd(() => {
      if (scale.value < 1.1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        savedScale.value = scale.value;
      }
    });

  const pan = Gesture.Pan()
    .enabled(zoomEnabled)
    .minPointers(2)
    .onUpdate((e) => {
      if (scale.value > 1.0) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");

      // Initialize notifications as soon as we have a user
      if (token) {
        notificationService.init();
      }

      if (!token && !isAuthPage) {
        setTimeout(() => router.replace("/login"), 0);
      } else if (token && role && (pathname === "/" || pathname === "/index")) {
        if (role === "admin") router.replace("/admin-dashboard");
        else router.replace(role === "farmer" ? "/farmer-dashboard" : "/buyer-dashboard");
      }
    };
    checkAuth();
  }, [segments, pathname, router, isAuthPage]);

  const themeMode = highContrast ? 'contrast' : (colorScheme || 'light');
  const backgroundColor = Colors[themeMode as keyof typeof Colors].background;

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <StatusBar
        barStyle={highContrast ? "light-content" : (colorScheme === 'dark' ? "light-content" : "dark-content")}
        backgroundColor="transparent"
        translucent
      />

      <GestureDetector gesture={composed}>
        <Animated.View style={[{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center' }, animatedStyle]}>
          <View style={{
            flex: 1,
            width: fontScale !== 1 ? `${100 / fontScale}%` : '100%',
            height: fontScale !== 1 ? `${100 / fontScale}%` : '100%',
            transform: fontScale !== 1 ? [{ scale: fontScale }, { translateX: 0 }, { translateY: 0 }] : [],
            backgroundColor: "transparent",
          }}>
            <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: "transparent" }}>
              <Stack
                initialRouteName="login"
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" }
                }}
              >
                <Stack.Screen name="login" />
                <Stack.Screen name="verify" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="marketplace" />
              </Stack>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>

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
