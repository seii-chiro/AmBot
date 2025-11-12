import { Colors } from "@/constants/theme";
import Octicons from "@expo/vector-icons/Octicons";
import {
  DrawerNavigationProp,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { useNavigation } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import ThemedText from "./themed-text";

const Header = () => {
  const navigation =
    useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const drawerStatus = useDrawerStatus();
  const isOpen = drawerStatus === "open";
  const colorScheme = useColorScheme();
  const theme = colorScheme ? Colors[colorScheme] : Colors.light;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => navigation.toggleDrawer()}
        style={styles.sidebarIcon}
      >
        <Octicons
          name={isOpen ? "sidebar-expand" : "sidebar-collapse"}
          size={20}
          color={theme.text}
        />
      </Pressable>
      <ThemedText type="subtitle">AmBot</ThemedText>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7ff",
  },
  sidebarIcon: {
    position: "absolute",
    left: 10,
  },
});
