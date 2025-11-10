import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

// Configure how notifications behave when the app is open
Notifications.setNotificationHandler({
    handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function PushNotif() {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    useEffect(() => {
        const setup = async () => {
            const token = await registerForPushNotificationsAsync();
            if (token) setExpoPushToken(token);
        };

        setup();

        // Foreground notification listener
        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                console.log('📩 Notification received (foreground):', notification);
            });

        // User taps notification
        responseListener.current =
            Notifications.addNotificationResponseReceivedListener((response) => {
                console.log('👆 Notification tapped:', response);
            });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    const handleSendTest = async () => {
        if (!expoPushToken) {
            Alert.alert('Error', 'No push token available.');
            return;
        }

        await sendPushNotification(expoPushToken);
        Alert.alert('✅ Notification sent!');
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ marginBottom: 8, fontSize: 16 }}>Your Expo Push Token:</Text>
            <Text selectable style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>
                {expoPushToken ?? 'Fetching...'}
            </Text>
            <Button title="Send Test Notification" onPress={handleSendTest} />
        </View>
    );
}

/**
 * Sends a push notification using Expo’s Push API.
 */
async function sendPushNotification(expoPushToken: string): Promise<void> {
    try {
        const message = {
            to: expoPushToken,
            title: 'Hello from Expo! 👋',
            body: 'This is a test notification 🔔',
        };

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Expo push send failed:', errorText);
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}

/**
 * Requests permission and returns the Expo push token for this device.
 */
async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
        Alert.alert('Push notifications require a physical device.');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        Alert.alert('Permission not granted for push notifications.');
        return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('🎯 Expo Push Token:', token);
    return token;
}
