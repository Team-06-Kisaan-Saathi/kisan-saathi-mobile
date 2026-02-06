import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function AddCrop() {
  return (
    <>
      <Stack.Screen options={{ title: "Add Crop" }} />
      <View style={{ padding: 16 }}>
        <Text>Add Crop Screen</Text>
      </View>
    </>
  );
}
