# Firebase Push Notifications Setup Guide

## Overview

This guide covers setting up Firebase Cloud Messaging (FCM) for push notifications in the Group Mind app, both for Expo managed workflow and post-eject scenarios.

## Current Setup Analysis

### Firebase Configuration

- ✅ Firebase project is configured (`group-mind`)
- ✅ Firebase SDK is installed (`firebase: ^11.7.1`)
- ✅ Basic Firebase services are initialized (Auth, Firestore, Realtime Database)
- ❌ Firebase Cloud Messaging (FCM) is not yet configured
- ❌ Push notification dependencies are not installed

## Option 1: Expo Managed Workflow (Current)

### Step 1: Install Expo Notifications

```bash
npx expo install expo-notifications
npx expo install expo-device
```

### Step 2: Configure app.json

```json
{
  "expo": {
    "name": "Group Mind",
    "slug": "group-mind",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#7291EE",
      "iosDisplayInForeground": true,
      "androidMode": "default",
      "androidCollapsedTitle": "New Message"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.groupmind",
      "supportsTablet": true
    },
    "android": {
      "package": "com.yourcompany.groupmind",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#7291EE"
      }
    }
  }
}
```

### Step 3: Create Push Notification Service

```typescript
// services/pushNotifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class PushNotificationService {
  private static instance: PushNotificationService;
  private expoPushToken: string | null = null;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log("Must use physical device for Push Notifications");
      return null;
    }

    try {
      // Request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return null;
      }

      // Get Expo push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "your-expo-project-id", // Get this from Expo dashboard
      });

      this.expoPushToken = token.data;
      console.log("Expo push token:", this.expoPushToken);

      // Set up notification listeners
      this.setupNotificationListeners();

      return this.expoPushToken;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  }

  private setupNotificationListeners() {
    // Handle notifications received while app is running
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
      // Handle the notification (update UI, etc.)
    });

    // Handle notification responses (when user taps notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response);
      // Navigate to specific screen based on notification
      this.handleNotificationResponse(response);
    });
  }

  private handleNotificationResponse(
    response: Notifications.NotificationResponse
  ) {
    const data = response.notification.request.content.data;

    // Navigate based on notification type
    switch (data.type) {
      case "new_message":
        // Navigate to group chat
        break;
      case "new_qa_post":
        // Navigate to Q&A section
        break;
      case "group_invitation":
        // Navigate to group invitation
        break;
      default:
        // Default navigation
        break;
    }
  }

  async saveTokenToFirebase(userId: string, token: string) {
    try {
      await setDoc(doc(db, "users", userId, "tokens", "push"), {
        expoPushToken: token,
        platform: Platform.OS,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error saving push token to Firebase:", error);
    }
  }

  async sendNotificationToUser(
    userId: string,
    notification: {
      title: string;
      body: string;
      data?: any;
    }
  ) {
    try {
      // Get user's push token from Firebase
      const tokenDoc = await getDoc(doc(db, "users", userId, "tokens", "push"));

      if (!tokenDoc.exists()) {
        console.log("No push token found for user:", userId);
        return;
      }

      const token = tokenDoc.data().expoPushToken;

      // Send via Expo's push service
      const message = {
        to: token,
        sound: "default",
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      };

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
```

### Step 4: Initialize in App.tsx

```typescript
// App.tsx
import { useEffect } from "react";
import { pushNotificationService } from "./services/pushNotifications";
import { useGroupContext } from "./store/GroupContext";

export default function App() {
  const { user } = useGroupContext();

  useEffect(() => {
    // Register for push notifications
    const registerNotifications = async () => {
      const token =
        await pushNotificationService.registerForPushNotifications();
      if (token && user) {
        await pushNotificationService.saveTokenToFirebase(user.uid, token);
      }
    };

    registerNotifications();
  }, [user]);

  // ... rest of your app
}
```

## Option 2: Post-Eject (Bare Workflow)

### Step 1: Install Native Dependencies

```bash
# After ejecting
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install react-native-push-notification
npm install @react-native-community/push-notification-ios # iOS only
```

### Step 2: Configure Firebase for Native

1. **Download google-services.json** (Android) and **GoogleService-Info.plist** (iOS) from Firebase Console
2. Place them in the appropriate native directories:
   - Android: `android/app/google-services.json`
   - iOS: `ios/GoogleService-Info.plist`

### Step 3: Android Configuration

```gradle
// android/build.gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}

// android/app/build.gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.2.1'
}
```

### Step 4: iOS Configuration

```objc
// ios/AppDelegate.mm
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Request permission for notifications
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;

  return YES;
}

// Handle notifications when app is in foreground
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBanner);
}
```

### Step 5: Create Native Push Service

```typescript
// services/nativePushNotifications.ts
import messaging from "@react-native-firebase/messaging";
import PushNotification from "react-native-push-notification";
import { Platform } from "react-native";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export class NativePushNotificationService {
  private static instance: NativePushNotificationService;
  private fcmToken: string | null = null;

  static getInstance(): NativePushNotificationService {
    if (!NativePushNotificationService.instance) {
      NativePushNotificationService.instance =
        new NativePushNotificationService();
    }
    return NativePushNotificationService.instance;
  }

  async initialize() {
    // Configure push notifications
    PushNotification.configure({
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === "ios",
    });

    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // Get FCM token
      this.fcmToken = await messaging().getToken();
      console.log("FCM Token:", this.fcmToken);

      // Set up message handlers
      this.setupMessageHandlers();
    }
  }

  private setupMessageHandlers() {
    // Handle messages when app is in foreground
    messaging().onMessage(async (remoteMessage) => {
      console.log("Foreground message received:", remoteMessage);

      // Show local notification
      PushNotification.localNotification({
        title: remoteMessage.notification?.title,
        message: remoteMessage.notification?.body || "",
        data: remoteMessage.data,
      });
    });

    // Handle notification taps
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log("Notification opened app:", remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // Handle app opened from notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("App opened from notification:", remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });
  }

  private handleNotificationTap(remoteMessage: any) {
    const data = remoteMessage.data;

    // Navigate based on notification type
    switch (data?.type) {
      case "new_message":
        // Navigate to group chat
        break;
      case "new_qa_post":
        // Navigate to Q&A section
        break;
      default:
        // Default navigation
        break;
    }
  }

  async saveTokenToFirebase(userId: string, token: string) {
    try {
      await setDoc(doc(db, "users", userId, "tokens", "push"), {
        fcmToken: token,
        platform: Platform.OS,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error saving FCM token to Firebase:", error);
    }
  }

  async sendNotificationToUser(
    userId: string,
    notification: {
      title: string;
      body: string;
      data?: any;
    }
  ) {
    try {
      // This would typically be done from your backend
      // For now, we'll use Firebase Functions or a server
      console.log("Sending notification to user:", userId, notification);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }
}

export const nativePushNotificationService =
  NativePushNotificationService.getInstance();
```

## Firebase Functions for Server-Side Notifications

### Step 1: Install Firebase Functions

```bash
npm install -g firebase-tools
firebase init functions
```

### Step 2: Create Notification Function

```typescript
// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const sendNotification = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snap, context) => {
    const notification = snap.data();

    try {
      // Get user's FCM token
      const userTokenDoc = await admin
        .firestore()
        .collection("users")
        .doc(notification.userId)
        .collection("tokens")
        .doc("push")
        .get();

      if (!userTokenDoc.exists) {
        console.log("No push token found for user:", notification.userId);
        return;
      }

      const token =
        userTokenDoc.data()?.fcmToken || userTokenDoc.data()?.expoPushToken;

      if (!token) {
        console.log("No valid push token found");
        return;
      }

      // Send notification
      const message = {
        token: token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        android: {
          notification: {
            channelId: "group-mind-notifications",
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });
```

## Notification Types for Group Mind

### 1. New Message Notifications

```typescript
// When a new message is sent to a group
await sendNotification({
  userId: targetUserId,
  title: `${senderName} sent a message`,
  body: messagePreview,
  data: {
    type: "new_message",
    groupId: groupId,
    messageId: messageId,
  },
});
```

### 2. Q&A Post Notifications

```typescript
// When someone asks a question in a group
await sendNotification({
  userId: targetUserId,
  title: `New question in ${groupName}`,
  body: questionPreview,
  data: {
    type: "new_qa_post",
    groupId: groupId,
    postId: postId,
  },
});
```

### 3. Group Invitation Notifications

```typescript
// When someone is invited to join a group
await sendNotification({
  userId: targetUserId,
  title: `Invitation to join ${groupName}`,
  body: `${inviterName} invited you to join their study group`,
  data: {
    type: "group_invitation",
    groupId: groupId,
    inviterId: inviterId,
  },
});
```

### 4. Resource Upload Notifications

```typescript
// When someone uploads a resource to a group
await sendNotification({
  userId: targetUserId,
  title: `New resource in ${groupName}`,
  body: `${uploaderName} uploaded ${fileName}`,
  data: {
    type: "new_resource",
    groupId: groupId,
    resourceId: resourceId,
  },
});
```

## Testing Push Notifications

### Expo Managed Workflow

```bash
# Send test notification
curl -H "Content-Type: application/json" \
     -X POST "https://exp.host/--/api/v2/push/send" \
     -d '{
       "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
       "title": "Test Notification",
       "body": "This is a test notification",
       "data": { "type": "test" }
     }'
```

### Native Workflow

```bash
# Use Firebase Console to send test messages
# Or use Firebase CLI
firebase messaging:send --token "FCM_TOKEN" --message '{
  "notification": {
    "title": "Test Notification",
    "body": "This is a test notification"
  },
  "data": {
    "type": "test"
  }
}'
```

## Best Practices

### 1. Token Management

- Store tokens securely in Firebase
- Update tokens when they refresh
- Handle token expiration gracefully

### 2. User Preferences

- Allow users to opt in/out of notifications
- Provide granular control (messages, Q&A, invitations, etc.)
- Respect user preferences

### 3. Notification Content

- Keep titles under 40 characters
- Keep bodies under 200 characters
- Use clear, actionable language

### 4. Performance

- Batch notifications when possible
- Use Firebase Functions for server-side processing
- Implement proper error handling

## Troubleshooting

### Common Issues

1. **Tokens not being saved**

   - Check Firebase permissions
   - Verify user authentication
   - Check network connectivity

2. **Notifications not received**

   - Verify device permissions
   - Check token validity
   - Test with Firebase Console

3. **App crashes on notification tap**
   - Implement proper navigation handling
   - Add error boundaries
   - Test on both platforms

### Debug Commands

```bash
# Check Expo push tokens
expo push:android:upload --api-key YOUR_API_KEY
expo push:ios:upload --api-key YOUR_API_KEY

# Test Firebase connection
firebase projects:list
firebase functions:log
```

## Conclusion

Push notifications are essential for user engagement in Group Mind. The setup process differs significantly between Expo managed and bare workflows, but both approaches provide robust notification capabilities. Choose the approach that best fits your development timeline and requirements.
