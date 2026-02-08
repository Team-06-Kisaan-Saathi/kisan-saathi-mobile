import { Ionicons } from "@expo/vector-icons";

import { useRouter, type Href } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import * as Vosk from "react-native-vosk";

type Lang = "en" | "hi" | "te";

const MODELS: Record<Lang, string> = {
  en: "vosk-model-small-en-in-0.4",
  hi: "vosk-model-small-hi-0.22",
  te: "vosk-model-small-te-0.42",
};

const LANG_LABEL: Record<Lang, string> = { en: "EN", hi: "HI", te: "TE" };

const GRAMMAR: Record<Lang, string[]> = {
  en: ["login", "sign in", "sign up", "market", "marketplace", "home", "back"],
  hi: ["लॉगिन", "मार्केट", "होम", "वापस"],
  te: ["లాగిన్", "మార్కెట్", "హోమ్", "వెనక్కి"],
};

export default function VoiceNavButton() {
  const router = useRouter();

  const handlersBoundRef = useRef(false);
  const loadedLangRef = useRef<Lang | null>(null);

  const [lang, setLang] = useState<Lang>("en");
  const [ready, setReady] = useState(false);
  const [listening, setListening] = useState(false);

  const log = (...args: any[]) => console.log("[VOICE]", ...args);

  const stop = async (reason = "manual") => {
    try {
      await Vosk.stop?.();
    } catch {}
    setListening(false);
    log("🛑 STOP", reason);
  };

  const unload = async () => {
    try {
      await Vosk.unload?.();
    } catch {}
    loadedLangRef.current = null;
    log("🧹 UNLOAD");
  };

  const loadModel = async (target: Lang) => {
    if (loadedLangRef.current === target) {
      log("✅ model already loaded:", target);
      return;
    }

    await stop("before-load");
    await unload();

    const key = MODELS[target];
    log("📦 Loading model:", key);

    await Vosk.loadModel(key);
    loadedLangRef.current = target;

    log("✅ Model loaded:", key);
  };

  const routeTo = async (path: Href) => {
    log("➡ ROUTE:", path);
    await stop("navigate");
    router.push(path);
  };

  const goBack = async () => {
    log("⬅ ROUTE: back()");
    await stop("navigate");
    router.back();
  };

  const handleCommand = async (raw: string) => {
    const text = (raw || "").trim().toLowerCase();
    if (!text) return;

    log("✅ HEARD (final):", text);

    // LOGIN
    if (
      text.includes("login") ||
      text.includes("sign in") ||
      text.includes("signin") ||
      text.includes("sign up") ||
      text.includes("लॉगिन") ||
      text.includes("లాగిన్")
    ) {
      await routeTo("/login");
      return;
    }

    // MARKETPLACE
    if (
      text.includes("market") ||
      text.includes("marketplace") ||
      text.includes("मार्केट") ||
      text.includes("మార్కెట్")
    ) {
      await routeTo("/marketplace");
      return;
    }

    // HOME
    if (
      text.includes("home") ||
      text.includes("होम") ||
      text.includes("హోమ్")
    ) {
      await routeTo("/");
      return;
    }

    // BACK
    if (
      text.includes("back") ||
      text.includes("वापस") ||
      text.includes("వెనక్కి")
    ) {
      await goBack();
      return;
    }

    log("❔ No matching command");
  };

  const bindAllHandlers = () => {
    const anyVosk: any = Vosk;

    const tryBind = (name: string, fn: any) => {
      const f = anyVosk?.[name];
      if (typeof f === "function") {
        try {
          f(fn);
          log("🔗 bound", name);
        } catch (e) {
          log("⚠️ bind failed", name, e);
        }
      } else {
        log("— no", name);
      }
    };

    tryBind("onResult", (e: any) => {
      log("📨 onResult:", e);

      const t =
        typeof e === "string"
          ? e
          : (e?.result ?? e?.text ?? e?.value ?? "").toString();

      if (t) handleCommand(t);
    });

    tryBind("onFinalResult", (e: any) => {
      log("📨 onFinalResult:", e);

      const t =
        typeof e === "string"
          ? e
          : (e?.result ?? e?.text ?? e?.value ?? "").toString();

      if (t) handleCommand(t);
    });

    tryBind("onPartialResult", (e: any) => {
      const p = (e?.partial ?? e?.text ?? e?.value ?? "").toString();
      if (p) log("… partial:", p);
    });

    tryBind("onPartial", (e: any) => {
      const p = (e?.partial ?? e?.text ?? e?.value ?? "").toString();
      if (p) log("… partial:", p);
    });

    tryBind("onEvent", (e: any) => {
      log("📨 onEvent:", e);
    });

    tryBind("onError", (e: any) => {
      log("❌ onError:", e);
      setListening(false);
    });
  };

  useEffect(() => {
    let alive = true;

    const init = async () => {
      try {
        if (!handlersBoundRef.current) {
          handlersBoundRef.current = true;
          bindAllHandlers();
        }

        await loadModel("en");

        if (alive) setReady(true);
      } catch (err) {
        log("❌ init failed:", err);
        if (alive) setReady(false);
        Alert.alert("Voice", "Model could not be loaded.");
      }
    };

    init();

    return () => {
      alive = false;
      stop("unmount");
      unload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cycleLanguage = async () => {
    const next: Lang = lang === "en" ? "hi" : lang === "hi" ? "te" : "en";
    log("🌐 Switch", lang, "→", next);

    setLang(next);

    try {
      setReady(false);
      await loadModel(next);
      setReady(true);
    } catch (e) {
      log("❌ Language switch failed:", e);
      Alert.alert(
        "Voice model error",
        "Model missing/incomplete on device.\nFix: Settings → Apps → digital-marketplace → Storage → Clear storage.\nThen open app again.",
      );
      setReady(false);
    }
  };

  const toggleListening = async () => {
    try {
      if (!ready) {
        Alert.alert("Voice", "Model is not ready yet.");
        return;
      }

      if (listening) {
        await stop("toggle");
        return;
      }

      await loadModel(lang);

      setListening(true);
      log("🎙 START (lang:", lang, ")");

      // Most compatible start: no args first
      try {
        await Vosk.start?.();
      } catch (e1) {
        // fallback with options
        try {
          await Vosk.start?.({ grammar: GRAMMAR[lang], timeout: 8000 });
        } catch (e2) {
          log("❌ start failed:", e1, e2);
          setListening(false);
        }
      }
    } catch (e) {
      log("❌ toggle error:", e);
      setListening(false);
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: 100,
        right: 24,
        zIndex: 999999,
        elevation: 999999,
        alignItems: "center",
      }}
    >
      {/* Language pill */}
      <Pressable
        onPress={cycleLanguage}
        style={{
          marginBottom: 10,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: "#111827",
          opacity: ready ? 1 : 0.6,
        }}
        accessibilityRole="button"
        accessibilityLabel="Change voice language"
      >
        <Text style={{ color: "white", fontWeight: "800" }}>
          {LANG_LABEL[lang]}
        </Text>
      </Pressable>

      {/* Mic button */}
      <Pressable
        onPress={toggleListening}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: listening ? "#dc4a26" : "#2d6ec9",
          opacity: ready ? 1 : 0.6,
        }}
        accessibilityRole="button"
        accessibilityLabel={
          listening ? "Stop voice input" : "Start voice input"
        }
      >
        {listening ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="mic" size={24} color="#fff" />
        )}
      </Pressable>
    </View>
  );
}
