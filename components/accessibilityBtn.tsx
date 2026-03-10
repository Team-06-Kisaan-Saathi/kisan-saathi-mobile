import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useTheme } from '../hooks/ThemeContext';

type Props = {
  onPress: () => void;
};

export default function AccessibilityFab({ onPress }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Accessibility options"
        accessibilityHint="Opens accessibility settings"
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        hitSlop={12}
      >
        <Ionicons name="accessibility" size={16} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 0,
    top: '30%',
    zIndex: 999999,
    elevation: 999999,
  },
  fab: {
    width: 32,
    height: 32,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#3B2F2F", // Muted dark brown
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { width: -2, height: 2 },
  },
  fabPressed: {
    opacity: 0.8,
    width: 36, // Slight expansion on press
  },
});
