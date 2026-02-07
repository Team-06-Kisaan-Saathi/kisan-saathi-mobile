import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable } from "react-native";
import * as Vosk from "react-native-vosk";

type Lang = "en" | "hi" | "te";

/**
 * expo-speech = Text → Speech (app talks)
 * react-native-vosk = Speech → Text (app listens)  ✅ requires custom dev client / EAS build
 */
const MODELS: Record<Lang, string> = {
  en: "vosk/en",
  hi: "vosk/hi",
  te: "vosk/te",
};

const LANG_LABEL: Record<Lang, string> = { en: "EN", hi: "HI", te: "TE" };

const GRAMMAR: Record<Lang, string[]> = {
  en: ["login", "sign in", "sign up", "market", "marketplace", "home", "back"],
  hi: ["लॉगिन", "मार्केट", "होम", "वापस"],
  te: ["లాగిన్", "మార్కెట్", "హోమ్", "వెనక్కి"],
};

function speak(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, { rate: 0.95, pitch: 1.0 });
  } catch {}
}

function normalizeText(e: any): string {
  if (!e) return "";
  if (typeof e === "string") return e;
  return String(e?.result ?? e?.text ?? e?.value ?? e?.partial ?? "");
}

export default function VoiceNavBtn() {
  const router = useRouter();

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
    } catch {}
    setListening(false);
    log("🛑 STOP:", reason);
  };

  const unload = async () => {
    try {
      await (Vosk as any).unload?.();
    } catch {}
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

    // LOGIN
    if (
      text.includes("login") ||
      text.includes("sign in") ||
      text.includes("signin") ||
      text.includes("sign up") ||
      text.includes("लॉगिन") ||
      text.includes("లాగిన్")
    ) {
      speak("Opening login");
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
      speak("Opening marketplace");
      await routeTo("/marketplace");
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

    // BACK
    if (
      text.includes("back") ||
      text.includes("वापस") ||
      text.includes("వెనక్కి")
    ) {
      speak("Going back");
      await goBack();
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
      } catch {}
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
    // ✅ prevent start before init/model load
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

  return (
    <>
      {/* Language toggle pill */}
      <Pressable
        onPress={cycleLanguage}
        style={{
          position: "absolute",
          bottom: 92,
          right: 24,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: "#111827",
          opacity: ready ? 1 : 0.6,
          zIndex: 999999,
          elevation: 999999,
        }}
        accessibilityRole="button"
        accessibilityLabel="Change voice language"
      >
        {/* Using Ionicons only on main button; pill shows text via accessibility label */}
        {/* If you want visible text, replace with <Text> but keep it simple for now */}
        <Ionicons name="language" size={18} color="#fff" />
      </Pressable>

      {/* Mic button */}
      <Pressable
        onPress={toggleListening}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: listening ? "#dc4a26" : "#2d6ec9",
          opacity: ready ? 1 : 0.6,
          zIndex: 999999,
          elevation: 999999,
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
    </>
  );
}
