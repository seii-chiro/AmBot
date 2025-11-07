import Octicons from "@expo/vector-icons/Octicons";
import { DrawerNavigationProp, useDrawerStatus } from "@react-navigation/drawer";
import { useNavigation } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import ThemedText from "./themed-text";

const Header = () => {
  const navigation = useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const drawerStatus = useDrawerStatus();
  const isOpen = drawerStatus === "open";

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.toggleDrawer()} style={styles.sidebarIcon}>
        <Octicons 
          name={isOpen ? "sidebar-expand" : "sidebar-collapse"} 
          size={24} 
          color="black" 
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
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    elevation: 4,
  },
  sidebarIcon: {
    position: "absolute",
    left: 10,
  }
});
