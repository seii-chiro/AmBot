import { usePushNotification } from "@/hooks/usePushNotification";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const PushNotification = () => {
  const { expoPushToken, notification } = usePushNotification();

  const data = JSON.stringify(notification, undefined, 2);

  console.log(expoPushToken?.data);

  return (
    <View style={styles.container}>
      <Text>{expoPushToken?.data}</Text>
      <Text>{data}</Text>
    </View>
  );
};

export default PushNotification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
