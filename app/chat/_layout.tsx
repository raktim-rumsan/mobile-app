import { Stack } from "expo-router";
import { useNavigation } from "@react-navigation/native";

export default function ChatLayout() {
  const navigation = useNavigation();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        header: () => null,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
