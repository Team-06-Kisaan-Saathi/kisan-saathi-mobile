import { Ionicons } from "@expo/vector-icons";
import Voice from "@react-native-voice/voice";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

export default function VoiceNavButton() {
  const router = useRouter();
  const [listening, setListening] = useState(false);

  useEffect(() => {
    console.log("VoiceNavButton mounted");

    Voice.onSpeechStart = () => {
      console.log("Speech started");
      setListening(true);
    };

    Voice.onSpeechEnd = () => {
      console.log("Speech ended");
      setListening(false);
    };

    Voice.onSpeechResults = (e) => {
      const text = (e.value?.[0] || "").toLowerCase();

      console.log("Speech results:", e.value);
      console.log("Parsed text:", text);

      if (text.includes("login")) {
        console.log("➡ Navigating to LOGIN");
        router.push("/login");
      } else if (
        text.includes("signin") ||
        text.includes("sign in") ||
        text.includes("sign up")
      ) {
        console.log("➡ Navigating to SIGN IN");
        router.push("/login");
      } else if (text.includes("market")) {
        console.log("➡ Navigating to MARKETPLACE");
        router.push("/marketplace");
      } else {
        console.log("No matching command found");
      }
    };

    Voice.onSpeechError = (e) => {
      console.log("Voice error:", e);
      setListening(false);
    };

    return () => {
      console.log("Cleaning up voice listeners");
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const toggleListening = async () => {
    try {
      if (listening) {
        console.log("Manually stopping voice");
        await Voice.stop();
        setListening(false);
        return;
      }

      console.log("Starting voice recognition...");
      await Voice.start("en-IN");
    } catch (e) {
      console.log("Voice start/stop error:", e);
      setListening(false);
    }
  };

  return (
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
      }}
      accessibilityRole="button"
      accessibilityLabel={listening ? "Stop voice input" : "Start voice input"}
    >
      {listening ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
          <Ionicons name="mic" size={24} color="#fff" />
        </Text>
      )}
    </Pressable>
  );
}
