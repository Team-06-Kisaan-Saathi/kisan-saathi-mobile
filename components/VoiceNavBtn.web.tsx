
import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

/**
 * Enhanced Web version of VoiceNavBtn
 * Uses Web Speech API (Recognition + Synthesis)
 */
export default function VoiceNavBtn() {
    const router = useRouter();
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(false);

    const recognitionRef = useRef<any>(null);

    // Text to Speech for Web
    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech to avoid overlap
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.lang = 'en-US';

            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setSupported(true);
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-IN'; // Better for Indian accents

            recognitionRef.current.onresult = (event: any) => {
                const text = event.results[0][0].transcript.toLowerCase().trim();
                console.log("[VOICE WEB] Heard:", text);
                handleCommand(text);
                setListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("[VOICE WEB] Error:", event.error);
                if (event.error === 'not-allowed') {
                    speak("Microphone access denied. Please allow it in browser settings.");
                } else if (event.error !== 'no-speech') {
                    speak("Voice error occurred.");
                }
                setListening(false);
            };

            recognitionRef.current.onend = () => {
                setListening(false);
            };
        }
    }, []);

    const handleCommand = (text: string) => {
        // LOGIN / SIGN IN
        if (text.includes("login") || text.includes("sign in") || text.includes("signin") || text.includes("sign up") || text.includes("account")) {
            speak("Navigating to login");
            setTimeout(() => router.push("/login"), 500);
        }
        // MARKETPLACE
        else if (text.includes("market") || text.includes("marketplace") || text.includes("mandi") || text.includes("buy") || text.includes("sell")) {
            speak("Navigating to marketplace");
            setTimeout(() => router.push("/marketplace"), 500);
        }
        // DASHBOARD / HOME
        else if (text.includes("home") || text.includes("dashboard") || text.includes("main")) {
            speak("Navigating to dashboard");
            setTimeout(() => router.push("/"), 500);
        }
        // SETTINGS
        else if (text.includes("setting") || text.includes("profile") || text.includes("edit")) {
            speak("Navigating to settings");
            setTimeout(() => router.push("/settings"), 500);
        }
        // NOTIFICATIONS
        else if (text.includes("notification") || text.includes("alerts") || text.includes("messages")) {
            speak("Navigating to notifications");
            setTimeout(() => router.push("/notifications"), 500);
        }
        // WEATHER
        else if (text.includes("weather") || text.includes("rain") || text.includes("forecast")) {
            speak("Navigating to weather");
            setTimeout(() => router.push("/weather"), 500);
        }
        // MANDI PRICES
        else if (text.includes("price") || text.includes("rate") || text.includes("mandi prices")) {
            speak("Navigating to mandi prices");
            setTimeout(() => router.push("/mandi-prices"), 500);
        }
        // BACK
        else if (text.includes("back") || text.includes("go back") || text.includes("return")) {
            speak("Going back");
            setTimeout(() => router.back(), 500);
        }
        else {
            speak("Command not recognized. I heard " + text);
        }
    };

    const toggleListening = () => {
        if (!supported) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (listening) {
            recognitionRef.current?.stop();
            setListening(false);
        } else {
            try {
                // We speak first, then start recognition to avoid the browser's "Listening" beep cutting off our speech
                speak("Listening...");

                // Small delay to ensure the word "Listening" is heard before the mic opens
                setTimeout(() => {
                    recognitionRef.current?.start();
                    setListening(true);
                }, 800);

            } catch (e) {
                console.error("[VOICE WEB] Start error:", e);
                setListening(false);
            }
        }
    };

    if (!supported) return null;

    return (
        <View style={styles.container}>
            <Pressable
                onPress={toggleListening}
                style={[styles.fab, listening && styles.fabActive]}
            >
                {listening ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Ionicons name="mic" size={24} color="#fff" />
                )}

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>VOICE</Text>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 20,
        right: 20,
        zIndex: 999999,
        elevation: 999999,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#2563eb",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    fabActive: {
        backgroundColor: "#ef4444",
        transform: [{ scale: 1.1 }],
    },
    badge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        backgroundColor: "#1f2937",
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#374151",
    },
    badgeText: {
        color: "#fff",
        fontSize: 8,
        fontWeight: "900",
    }
});
