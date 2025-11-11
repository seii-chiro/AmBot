import { usePushNotification } from "@/hooks/usePushNotification";
import { Stack } from "expo-router";
import React from "react";

const RootLayout = () => {
  usePushNotification();
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default RootLayout;
