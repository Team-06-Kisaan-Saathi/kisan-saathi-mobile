import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function MyListings() {
  return (
    <>
      <Stack.Screen options={{ title: "My Listings" }} />
      <View style={{ padding: 16 }}>
        <Text>My Listings Screen</Text>
      </View>
    </>
  );
}
