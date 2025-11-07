import { Drawer } from "expo-router/drawer";
import SafeAreaViewWrapper from "../components/safe-area-view-wrapper";

export default function RootLayout() {
  return (
    <SafeAreaViewWrapper>
      <Drawer screenOptions={{  }}>
        <Drawer.Screen 
          name="index" 
          options={{ 
            drawerLabel: "Chat",
            title: "Chat" 
          }} 
        />
        <Drawer.Screen 
          name="(history)" 
          options={{ 
            drawerLabel: "History",
            title: "History",
          }} 
        />
      </Drawer>
    </SafeAreaViewWrapper>
  );
}
