import { Redirect } from 'expo-router';

export default function LandingPage() {
  // Simply redirect to the tabs route
  return <Redirect href="/(tabs)/home" />;
}
