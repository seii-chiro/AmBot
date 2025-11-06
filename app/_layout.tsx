import { Stack } from "expo-router";
import SafeAreaViewWrapper from "./components/safe-area-view-wrapper";

export default function RootLayout() {
  return (
    <SafeAreaViewWrapper>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaViewWrapper>
  );
}
