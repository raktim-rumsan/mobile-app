import LoginForm from "@/components/LoginForm";
import ProfileCard from "@/components/ProfileCard";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/auth";
import { ActivityIndicator } from "react-native";

export default function HomeScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ProfileCard />
    </ThemedView>
  );
}
