import * as Notifications from "expo-notifications";

/**
 * Send a local notification (doesn't require internet or push tokens)
 * This is the main utility - use your PushNotif.tsx for push notifications
 */
export async function sendLocalNotification(
  title: string,
  body: string
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { timestamp: Date.now() },
    },
    trigger: null, // Show immediately
  });
}
