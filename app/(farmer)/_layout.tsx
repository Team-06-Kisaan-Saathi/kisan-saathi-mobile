import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTheme } from '../../hooks/ThemeContext';
import NavFarmer from "../../components/navigation/Nav";

export default function FarmerLayout() {
  const { highContrast } = useTheme();
    return (
        <View style={[styles.container, highContrast && { backgroundColor: "#000" }]}>
            {/* Pages render here */}
            <View style={[styles.content, highContrast && { backgroundColor: "#000" }]}>
                <Stack screenOptions={{ headerShown: false }} />
            </View>

            {/* Persistent Bottom Nav */}
            <NavFarmer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingBottom: 70, // Space for bottom nav
    },
});
