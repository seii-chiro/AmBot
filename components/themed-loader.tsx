import React from "react";
import { ActivityIndicator, useColorScheme } from "react-native";
import ThemedView from "./themed-view";

const ThemedLoader = () => {
  const colorScheme = useColorScheme();

  return (
    <ThemedView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <ActivityIndicator
        size="large"
        color={`${colorScheme === "dark" ? "#ffffff" : "#000000"}`}
      />
    </ThemedView>
  );
};

export default ThemedLoader;
