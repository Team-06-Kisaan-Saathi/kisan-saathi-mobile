
import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

/**
 * Web version of VoiceNavBtn
 * Uses browser's Native Speech Recognition API (Web Speech API)
 */
export default function VoiceNavBtn() {
    const router = useRouter();
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(false);

    // Web Speech API
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setSupported(true);
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const text = event.results[0][0].transcript.toLowerCase();
                console.log("[VOICE WEB] Heard:", text);
                handleCommand(text);
                setListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("[VOICE WEB] Error:", event.error);
                setListening(false);
            };

            recognitionRef.current.onend = () => {
                setListening(false);
            };
        }
    }, []);

    const handleCommand = (text: string) => {
        if (text.includes("login") || text.includes("sign in")) {
            router.push("/login");
        } else if (text.includes("market") || text.includes("marketplace")) {
            router.push("/marketplace");
        } else if (text.includes("home")) {
            router.push("/");
        } else if (text.includes("back")) {
            router.back();
        } else if (text.includes("notification")) {
            router.push("/notifications");
        } else if (text.includes("setting")) {
            router.push("/settings");
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
                recognitionRef.current?.start();
                setListening(true);
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
                    <Text style={styles.badgeText}>WEB</Text>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 110,
        right: 20,
        zIndex: 999999,
        elevation: 999999,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
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
