import SafeAreaViewWrapper from "@/components/safe-area-view-wrapper";
import ThemedText from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Conversation } from "@/hooks/useMessageHistory";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";

export async function loadConversations(): Promise<Conversation[]> {
  try {
    const jsonValue = await AsyncStorage.getItem("conversations");
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error loading conversations:", e);
    return [];
  }
}

function CustomDrawerContent(props: any) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      const history = await loadConversations();
      setConversations(history);
    };

    fetchConversations();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <ThemedText type="title">AmBot</ThemedText>
      </View>

      <Pressable
        style={styles.newConversationButton}
        onPress={() => {
          router.push({ pathname: `/` as any });
          props.navigation.closeDrawer();
        }}
      >
        <ThemedText type="subtitle">New Conversation</ThemedText>
      </Pressable>

      <ThemedText type="subtitle" style={{ padding: 10 }}>
        History
      </ThemedText>

      {conversations.length > 0 ? (
        conversations.map((conversation) => (
          <DrawerItem
            key={conversation.id}
            label={conversation.title}
            onPress={() => {
              router.push({ pathname: `/${conversation.id}` as any });
              props.navigation.closeDrawer();
            }}
          />
        ))
      ) : (
        <ThemedText style={{ padding: 10 }}>No history available.</ThemedText>
      )}
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ? Colors[colorScheme] : Colors.light;

  return (
    <SafeAreaViewWrapper>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: theme.background,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
        }}
      />
    </SafeAreaViewWrapper>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
  },
  drawerHeaderText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  newConversationButton: {
    padding: 10,
  },
});
