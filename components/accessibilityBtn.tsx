import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";



type Props = {
  onPress: () => void;
};

export default function AccessibilityFab({ onPress }: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Accessibility options"
        accessibilityHint="Opens accessibility settings"
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        hitSlop={12}
      >
<Ionicons
  name="accessibility-outline"
  size={24}
  color="#fff"
/>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    top: 52, 
    zIndex: 999,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 26,
    backgroundColor: "#8c8c5d",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6, //shadow (Android)
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  icon: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "800",
  },
});
