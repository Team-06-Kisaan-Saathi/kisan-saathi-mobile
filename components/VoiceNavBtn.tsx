
import { Ionicons } from "@expo/vector-icons";
import { Animated, PanResponder } from "react-native";

import { usePathname, useRouter, type Href } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import * as Vosk from "react-native-vosk";

type Lang = "en" | "hi" | "te";

/**
 * expo-speech = Text → Speech (app talks)
 * react-native-vosk = Speech → Text (app listens)  requires custom dev client / EAS build
 */
const MODELS: Record<Lang, string> = {
  en: "vosk-model-small-en-in-0.4",
  hi: "vosk-model-small-hi-0.22",
  te: "vosk-model-small-te-0.42",
};

const LANG_LABEL: Record<Lang, string> = { en: "EN", hi: "HI", te: "TE" };

// Pages where navigation should be disabled
const RESTRICTED_ROUTES = ["/login", "/signin", "/verify", "/set-pin", "/profile-setup", "/profile-location"];

const GRAMMAR: Record<Lang, string[]> = {
  en: [
    "home", "back", "market", "marketplace", "farmer", "farmer dashboard", "buyer", "buyer dashboard",
    "profile", "mandi", "mandi prices", "live auctions", "auctions", "my listings", "listings",
    "my bids", "bids", "browse", "browse crops", "add crop", "alerts", "notifications",
    "ai insights", "insights", "market insights", "messages", "chat", "edit profile", "settings"
  ],
  hi: [
    "होम", "वापस", "मार्केट", "किसान", "किसान डैशबोर्ड", "खरीदार", "खरीदार डैशबोर्ड",
    "प्रोफाइल", "मंडी", "मंडी भाव", "लाइव नीलामी", "नीलामी", "मेरी लिस्टिंग", "लिस्टिंग",
    "मेरी बोलियां", "बोली", "फसल ब्राउज़", "फसल जोड़ें", "अलर्ट", "सूचनाएं",
    "एआई इनसाइट्स", "बाजार इनसाइट्स", "संदेश", "चैट", "प्रोफाइल संपादित", "सेटिंग्स"
  ],
  te: [
    "హోమ్", "వెనక్కి", "మార్కెట్", "రైతు", "రైతు డాష్‌బోర్డ్", "కొనుగోలుదారు", "కొనుగోలుదారు డాష్‌బోర్డ్",
    "ప్రొఫైల్", "మండి", "మండి ధరలు", "లైవ్ వేలం", "వేలం", "నా జాబితాలు", "జాబితాలు",
    "నా బిడ్లు", "బిడ్", "పంటలు చూడండి", "పంట జోడించు", "అలర్ట్స్", "నోటిఫికేషన్స్",
    "AI అంతర్దృష్టులు", "మార్కెట్ అంతర్దృష్టులు", "సందేశాలు", "చాట్", "ప్రొఫైల్ సవరించు", "సెట్టింగ్స్"
  ],
};

function speak(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, { rate: 0.95, pitch: 1.0 });
  } catch { }
}

function normalizeText(e: any): string {
  if (!e) return "";
  if (typeof e === "string") return e;
  return String(e?.result ?? e?.text ?? e?.value ?? e?.partial ?? "");
}

export default function VoiceNavBtn() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't render on restricted routes (auth/onboarding pages)
  const isRestricted = RESTRICTED_ROUTES.some(route => pathname === route || pathname.startsWith(route));

  const [lang, setLang] = useState<Lang>("en");
  const [ready, setReady] = useState(false);
  const [listening, setListening] = useState(false);

  const loadedLangRef = useRef<Lang | null>(null);
  const handlersBoundRef = useRef(false);
  const unmountedRef = useRef(false);

  const log = (...args: any[]) => console.log("[VOICE]", ...args);

  const stop = async (reason = "manual") => {
    try {
      await (Vosk as any).stop?.();
    } catch { }
    setListening(false);
    log("🛑 STOP:", reason);
  };

  const unload = async () => {
    try {
      await (Vosk as any).unload?.();
    } catch { }
    loadedLangRef.current = null;
    log("🧹 UNLOAD");
  };

  const loadModel = async (target: Lang) => {
    if (loadedLangRef.current === target) return;

    await stop("before-load");
    await unload();

    const key = MODELS[target];
    log("📦 Loading model:", key);

    await (Vosk as any).loadModel(key);

    loadedLangRef.current = target;
    log("✅ Model loaded:", key);
  };

  const routeTo = async (path: Href) => {
    await stop("navigate");
    router.push(path);
  };

  const goBack = async () => {
    await stop("navigate");
    router.back();
  };

  const handleCommand = async (raw: string) => {
    const text = (raw || "").trim().toLowerCase();
    if (!text) return;

    log("✅ HEARD:", text);

    // BACK - check first for quick navigation
    if (
      text.includes("back") ||
      text.includes("वापस") ||
      text.includes("వెనక్కి")
    ) {
      speak("Going back");
      await goBack();
      return;
    }

    // HOME
    if (
      text.includes("home") ||
      text.includes("होम") ||
      text.includes("హోమ్")
    ) {
      speak("Going home");
      await routeTo("/");
      return;
    }

    // FARMER DASHBOARD
    if (
      text.includes("farmer dashboard") ||
      text.includes("farmer") ||
      text.includes("किसान डैशबोर्ड") ||
      text.includes("किसान") ||
      text.includes("రైతు డాష్‌బోర్డ్") ||
      text.includes("రైతు")
    ) {
      speak("Opening farmer dashboard");
      await routeTo("/farmer-dashboard");
      return;
    }

    // BUYER DASHBOARD
    if (
      text.includes("buyer dashboard") ||
      text.includes("buyer") ||
      text.includes("खरीदार डैशबोर्ड") ||
      text.includes("खरीदार") ||
      text.includes("కొనుగోలుదారు డాష్‌బోర్డ్") ||
      text.includes("కొనుగోలుదారు")
    ) {
      speak("Opening buyer dashboard");
      await routeTo("/buyer-dashboard");
      return;
    }

    // PROFILE
    if (
      text.includes("profile") ||
      text.includes("प्रोफाइल") ||
      text.includes("ప్రొఫైల్")
    ) {
      // Check for edit profile specifically
      if (
        text.includes("edit") ||
        text.includes("संपादित") ||
        text.includes("సవరించు")
      ) {
        speak("Opening edit profile");
        await routeTo("/farmer");
        return;
      }
      speak("Opening profile");
      await routeTo("/profile");
      return;
    }

    // MANDI PRICES
    if (
      text.includes("mandi") ||
      text.includes("mandi prices") ||
      text.includes("मंडी") ||
      text.includes("मंडी भाव") ||
      text.includes("మండి") ||
      text.includes("మండి ధరలు")
    ) {
      speak("Opening mandi prices");
      await routeTo("/mandi-prices");
      return;
    }

    // MARKETPLACE / MARKET (check after mandi to avoid conflicts)
    if (
      text.includes("marketplace") ||
      text.includes("market") ||
      text.includes("मार्केट") ||
      text.includes("మార్కెట్")
    ) {
      // Check for market insights specifically
      if (
        text.includes("insight") ||
        text.includes("इनसाइट्स") ||
        text.includes("अंतर्दृष्टि") ||
        text.includes("అంతర్దృష్టులు")
      ) {
        speak("Opening market insights");
        await routeTo("/market-insights");
        return;
      }
      speak("Opening marketplace");
      await routeTo("/marketplace");
      return;
    }

    // LIVE AUCTIONS
    if (
      text.includes("live auction") ||
      text.includes("auction") ||
      text.includes("लाइव नीलामी") ||
      text.includes("नीलामी") ||
      text.includes("లైవ్ వేలం") ||
      text.includes("వేలం")
    ) {
      speak("Opening live auctions");
      await routeTo("/live-auctions");
      return;
    }

    // MY LISTINGS
    if (
      text.includes("my listing") ||
      text.includes("listing") ||
      text.includes("मेरी लिस्टिंग") ||
      text.includes("लिस्टिंग") ||
      text.includes("నా జాబితాలు") ||
      text.includes("జాబితాలు")
    ) {
      speak("Opening my listings");
      await routeTo("/my-listings");
      return;
    }

    // MY BIDS
    if (
      text.includes("my bid") ||
      text.includes("bid") ||
      text.includes("मेरी बोलियां") ||
      text.includes("बोली") ||
      text.includes("నా బిడ్లు") ||
      text.includes("బిడ్")
    ) {
      speak("Opening my bids");
      await routeTo("/my-bids");
      return;
    }

    // BROWSE CROPS
    if (
      text.includes("browse crop") ||
      text.includes("browse") ||
      text.includes("फसल ब्राउज़") ||
      text.includes("पంటలు చూడండి")
    ) {
      speak("Opening browse crops");
      await routeTo("/browse-crops");
      return;
    }

    // ADD CROP
    if (
      text.includes("add crop") ||
      text.includes("फसल जोड़ें") ||
      text.includes("పంట జోడించు")
    ) {
      speak("Opening add crop");
      await routeTo("/add-crop");
      return;
    }

    // ALERTS / NOTIFICATIONS
    if (
      text.includes("alert") ||
      text.includes("notification") ||
      text.includes("अलर्ट") ||
      text.includes("सूचनाएं") ||
      text.includes("అలర్ట్స్") ||
      text.includes("నోటిఫికేషన్స్")
    ) {
      speak("Opening alerts");
      await routeTo("/alerts");
      return;
    }

    // AI INSIGHTS
    if (
      text.includes("ai insight") ||
      text.includes("insight") ||
      text.includes("एआई इनसाइट्स") ||
      text.includes("AI అంతర్దృష్టులు")
    ) {
      speak("Opening AI insights");
      await routeTo("/ai-insights");
      return;
    }

    // MESSAGES / CHAT
    if (
      text.includes("message") ||
      text.includes("chat") ||
      text.includes("संदेश") ||
      text.includes("चैट") ||
      text.includes("సందేశాలు") ||
      text.includes("చాట్")
    ) {
      speak("Opening messages");
      await routeTo("/messages");
      return;
    }

    // EDIT PROFILE (standalone check)
    if (
      text.includes("edit profile") ||
      text.includes("प्रोफाइल संपादित") ||
      text.includes("ప్రొఫైల్ సవరించు")
    ) {
      speak("Opening edit profile");
      await routeTo("/edit-profile");
      return;
    }

    speak("Command not recognized");
  };

  const bindHandlersOnce = () => {
    const anyVosk: any = Vosk;

    const bind = (name: string, fn: any) => {
      const b = anyVosk?.[name];
      if (typeof b === "function") {
        try {
          b(fn);
          log("🔗 bound", name);
        } catch (e) {
          log("⚠️ bind failed", name, e);
        }
      } else {
        log("— no", name);
      }
    };

    bind("onFinalResult", (e: any) => {
      const t = normalizeText(e);
      if (t) handleCommand(t);
    });

    // fallback: some versions emit onResult
    bind("onResult", (e: any) => {
      const t = normalizeText(e);
      if (t) handleCommand(t);
    });

    bind("onPartialResult", (e: any) => {
      const p = normalizeText(e);
      if (p) log("… partial:", p);
    });

    bind("onPartial", (e: any) => {
      const p = normalizeText(e);
      if (p) log("… partial:", p);
    });

    bind("onError", (e: any) => {
      log("❌ onError:", e);
      setListening(false);
      speak("Voice error");
    });

    bind("onEvent", (e: any) => {
      log("📨 onEvent:", e);
    });
  };

  useEffect(() => {
    unmountedRef.current = false;

    const init = async () => {
      try {
        if (!handlersBoundRef.current) {
          handlersBoundRef.current = true;
          bindHandlersOnce();
        }

        await loadModel("en");

        if (!unmountedRef.current) setReady(true);
      } catch (err) {
        log("❌ init failed:", err);
        if (!unmountedRef.current) setReady(false);
        Alert.alert(
          "Voice",
          "Vosk model could not be loaded.\nMake sure you are using a custom dev client and models are available.",
        );
      }
    };

    init();

    return () => {
      unmountedRef.current = true;
      stop("unmount");
      unload();
      try {
        Speech.stop();
      } catch { }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cycleLanguage = async () => {
    const next: Lang = lang === "en" ? "hi" : lang === "hi" ? "te" : "en";
    setLang(next);

    try {
      setReady(false);
      speak(next === "en" ? "English" : next === "hi" ? "Hindi" : "Telugu");
      await loadModel(next);
      setReady(true);
    } catch (e) {
      log("❌ language switch failed:", e);
      setReady(false);
      Alert.alert(
        "Voice model error",
        "Model missing/incomplete on device.\nEnsure Vosk models exist for this language.",
      );
    }
  };

  const toggleListening = async () => {
    // prevent start before init/model load
    if (!ready) {
      Alert.alert("Voice", "Model is not ready yet.");
      return;
    }

    if (listening) {
      speak("Stopped");
      await stop("toggle");
      return;
    }

    try {
      await loadModel(lang);

      setListening(true);
      speak("Listening");
      log("🎙 START (lang:", lang, ")");

      // Most compatible start: no args first
      try {
        await (Vosk as any).start?.();
      } catch {
        // fallback with options
        await (Vosk as any).start?.({ grammar: GRAMMAR[lang], timeout: 8000 });
      }
    } catch (e) {
      log("❌ start failed:", e);
      setListening(false);
      speak("Could not start listening");
    }
  };

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,

      onPanResponderGrant: () => {
        pan.setOffset({
          // @ts-ignore
          x: pan.x.__getValue(),
          // @ts-ignore
          y: pan.y.__getValue(),
        });
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),

      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    }),
  ).current;

  // Don't show voice button on auth/onboarding pages
  if (isRestricted) {
    return null;
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        position: "absolute",
        bottom: 180,
        right: 24,
        zIndex: 9999,
        elevation: 9999,
        transform: pan.getTranslateTransform(),
      }}
    >
      <Pressable
        onPress={toggleListening}
        onLongPress={cycleLanguage} // long press switches EN/HI/TE
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: listening ? "#dc4a26" : "#2d6ec9",
          opacity: ready ? 1 : 0.6,
        }}
        accessibilityRole="button"
        accessibilityLabel={
          listening
            ? `Stop voice input (${LANG_LABEL[lang]})`
            : `Start voice input (${LANG_LABEL[lang]})`
        }
        accessibilityHint="Drag to move. Long press to change language."
      >
        {listening ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="mic" size={26} color="#fff" />
        )}

        {/* Language label INSIDE the button */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: 6,
            right: 6,
            backgroundColor: "rgba(0,0,0,0.55)",
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
            {LANG_LABEL[lang]}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
