import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function MandiPrices() {
  return (
    <>
      <Stack.Screen options={{ title: "Mandi Prices" }} />
      <View style={{ padding: 16 }}>
        <Text>Mandi Prices Screen</Text>
      </View>
    </>
  );
}
