import { usePushNotification } from "@/hooks/usePushNotification";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

const RootLayout = () => {
  usePushNotification();
  return (
    <>
      <StatusBar animated style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
};

export default RootLayout;
