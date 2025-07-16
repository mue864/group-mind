# Agora Video Calling Implementation Guide

## 🎯 **Overview**

This guide covers the implementation of video calling in GroupMind using Agora's React Native SDK. The implementation provides a complete video calling solution with:

- **AgoraService**: Core service for managing video calls with singleton pattern
- **VideoCall Component**: Comprehensive UI component for video calling interface
- **CallInvitation Component**: Modal for inviting others to calls with sharing options
- **Integration with Group Context**: Seamless integration with existing group system
- **Cross-platform Support**: Works on both iOS and Android
- **Real-time Communication**: Low-latency audio and video streaming

## 📋 **Prerequisites**

1. **Agora Account**: You have an Agora account with App ID (`e7f6e9aeecf14b2ba10e3f40be9f56e7`)
2. **React Native Agora SDK**: `react-native-agora` package installed
3. **Permissions**: Camera and microphone permissions configured
4. **Ejected App**: **IMPORTANT** - Agora requires a development build or bare React Native app (not Expo Go)

## ⚠️ **Important: Expo Go Limitation**

**Agora SDK does not work in Expo Go** due to native module dependencies. You must:

1. **Eject to Development Build**: Use `expo prebuild` and `expo run:android/ios`
2. **Or Use Bare React Native**: Create a bare React Native project
3. **Development Build**: Use `expo install --fix` after ejecting

## 🔧 **Setup Instructions**

### 1. **Install Dependencies**

```bash
# Install Agora SDK
npm install react-native-agora

# For development build (after ejecting)
expo install --fix
```

### 2. **Configure App ID**

Your Agora App ID is already configured in `services/agoraService.ts`:

```typescript
private readonly APP_ID = 'e7f6e9aeecf14b2ba10e3f40be9f56e7';
```

### 3. **Platform Configuration**

#### **Android (`android/app/src/main/AndroidManifest.xml`)**

Add these permissions after ejecting:

```xml
<uses-permission android:name="android.permission.READ_PHONE_STATE"/>
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

#### **iOS (`ios/YourApp/Info.plist`)**

Add these keys after ejecting:

```xml
<key>NSCameraUsageDescription</key>
<string>Camera permission is required for video calls</string>
<key>NSMicrophoneUsageDescription</key>
<string>Microphone permission is required for audio calls</string>
```

### 4. **Metro Configuration**

Update `metro.config.js` to handle Agora:

```javascript
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  "react-native-webrtc": "react-native-webrtc",
};

module.exports = config;
```

## 🚀 **Usage**

### 1. **Starting a Call**

Navigate to the call screen:

```typescript
router.push(`/(groups)/${groupId}/call`);
```

### 2. **Call Types**

- **Video Call**: Full video and audio with camera controls
- **Audio Call**: Audio only (video disabled for bandwidth optimization)

### 3. **Call Controls**

- **🎤 Mute/Unmute**: Toggle microphone with visual feedback
- **📹 Video On/Off**: Toggle camera (video calls only)
- **🔄 Switch Camera**: Switch between front/back camera
- **📤 Invite**: Share call link with others
- **📞 End Call**: Leave the call and return to group

### 4. **Inviting Others**

1. Tap the "Invite" button during a call
2. Choose from options:
   - **Share Call Link**: Share via native sharing
   - **Copy Link**: Copy to clipboard
   - **Send Notifications**: Push notifications (future feature)

## 📁 **File Structure**

```
services/
├── agoraService.ts          # Core Agora service (singleton)
components/
├── VideoCall.tsx           # Video call UI component
├── CallInvitation.tsx      # Call invitation modal
app/(groups)/[groupId]/
├── call.tsx                # Call screen with type selection
agora/
├── react.tsx               # Agora UI Kit example (alternative)
├── sampleCode.tsx          # Raw SDK example (reference)
```

## 🔧 **Key Components**

### **AgoraService (`services/agoraService.ts`)**

Core service managing Agora functionality with singleton pattern:

```typescript
// Get service instance
const agoraService = AgoraService.getInstance();

// Initialize the service
await agoraService.initialize();

// Join a channel
await agoraService.joinChannel(channelName);

// Toggle video/audio
await agoraService.enableLocalVideo(enabled);
await agoraService.enableLocalAudio(enabled);

// Switch camera
await agoraService.switchCamera();

// Leave channel
await agoraService.leaveChannel();
```

**Key Features:**

- **Singleton Pattern**: Global access across the app
- **Automatic Participant Management**: Track join/leave events
- **Event Handling**: Comprehensive event callbacks
- **Connection State Monitoring**: Real-time connection status
- **Error Handling**: Robust error management
- **Resource Management**: Proper cleanup and memory management

### **VideoCall Component (`components/VideoCall.tsx`)**

Main video calling interface with comprehensive controls:

```typescript
<VideoCall
  channelName={`group-${groupId}`}
  onEndCall={handleEndCall}
  callType="video"
  groupName="My Group"
/>
```

**Features:**

- **Local and Remote Video Rendering**: Using RtcSurfaceView
- **Call Controls**: Mute, video, camera switch, invite, end call
- **Participant List**: Real-time participant updates
- **Connection Status Display**: Visual connection indicators
- **Call Invitation Integration**: Seamless invitation flow
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility Support**: Screen reader friendly

### **CallInvitation Component (`components/CallInvitation.tsx`)**

Modal for inviting others with multiple sharing options:

```typescript
<CallInvitation
  visible={showInvitation}
  onClose={() => setShowInvitation(false)}
  channelName={channelName}
  callType={callType}
  groupName={groupName}
/>
```

**Features:**

- **Native Sharing**: Use device's native share functionality
- **Link Generation**: Create shareable call links
- **Copy to Clipboard**: Easy link copying
- **Push Notifications**: Placeholder for future implementation
- **Instructions**: Clear joining instructions
- **Cross-platform**: Works on iOS and Android

## 🎨 **UI/UX Features**

### **Video Layout**

- **Local Video**: Small picture-in-picture in top-right corner
- **Remote Videos**: Full-screen or grid layout for multiple participants
- **Placeholder**: Avatar with user name when video is disabled
- **Loading States**: Smooth transitions and loading indicators

### **Call Controls**

- **Bottom Bar**: All controls in a horizontal layout
- **Visual Feedback**: Icons change based on state (muted, video off)
- **Accessibility**: Clear button labels and states
- **Touch Targets**: Properly sized for mobile interaction

### **Status Indicators**

- **Connection Status**: Connecting, Connected, Reconnecting, Disconnected
- **Participant Count**: Real-time participant updates
- **Audio/Video States**: Visual indicators for mute/video off
- **Network Quality**: Connection quality indicators (future)

## 🔒 **Security Considerations**

### **Token Authentication**

For production, implement token-based authentication:

```typescript
// In agoraService.ts
async joinChannel(channelName: string, token?: string, uid?: number): Promise<void> {
  // Use token for secure authentication
  await this.engine?.joinChannel(token || null, channelName, null, uid || 0);
}
```

### **Channel Naming**

Use secure channel names to prevent unauthorized access:

```typescript
const channelName = `group-${groupId}-${Date.now()}`;
```

### **User Validation**

Validate users before allowing channel access:

```typescript
// Check if user is member of the group
if (!isGroupMember(userId, groupId)) {
  throw new Error("Unauthorized access to group call");
}
```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **"react-native-agora is not linked and won't work in Expo Go"**

   **Solution**: Eject to development build:

   ```bash
   expo prebuild
   expo run:android  # or expo run:ios
   ```

2. **"Failed to initialize Agora engine"**

   - Check App ID configuration
   - Verify network connectivity
   - Ensure permissions are granted
   - Check if running on physical device (not simulator)

3. **"Camera/microphone not working"**

   - Check device permissions in settings
   - Verify hardware availability
   - Test with device settings
   - Ensure not in airplane mode

4. **"Cannot join channel"**

   - Check network connection
   - Verify channel name format
   - Ensure App ID is correct
   - Check if channel name contains invalid characters

5. **"Video not displaying"**
   - Check if video tracks are enabled
   - Verify RtcSurfaceView configuration
   - Check browser console for errors
   - Ensure video permissions are granted

### **Debug Mode**

Enable debug logging in `services/agoraService.ts`:

```typescript
// Add this to the constructor
if (__DEV__) {
  console.log("Agora Service initialized in debug mode");
  console.log("App ID:", this.APP_ID);
}
```

### **Testing Checklist**

1. **Single Device Test**: Use multiple browser tabs or devices
2. **Multi-Device Test**: Use different devices (iOS, Android)
3. **Network Testing**: Test with different network conditions
4. **Permission Testing**: Test with denied permissions
5. **Background Testing**: Test app behavior in background

## 📱 **Performance Optimization**

### **Video Quality**

Adjust video constraints based on device capabilities:

```typescript
// In agoraService.ts
const videoConfig = {
  width: 640,
  height: 480,
  frameRate: 15,
  bitrate: 800,
};
```

### **Bandwidth Management**

Implement bandwidth estimation and quality adaptation:

```typescript
// Monitor network quality
this.engine.onNetworkQuality = (uid, quality) => {
  // Adjust video quality based on network
};
```

### **Memory Management**

Properly clean up streams and connections:

```typescript
async destroy(): Promise<void> {
  await this.leaveChannel();
  this.engine?.destroy();
  this.participants.clear();
}
```

### **Battery Optimization**

Optimize for mobile battery usage:

```typescript
// Disable video when app goes to background
AppState.addEventListener("change", (nextAppState) => {
  if (nextAppState === "background") {
    this.enableLocalVideo(false);
  }
});
```

## 🔄 **Future Enhancements**

- [ ] **Screen Sharing**: Share device screen during calls
- [ ] **Recording Capabilities**: Record calls for later review
- [ ] **Background Blur/Filters**: Video effects and filters
- [ ] **Virtual Backgrounds**: Custom background images
- [ ] **Call Recording**: Save call recordings
- [ ] **Push Notifications**: Incoming call notifications
- [ ] **Call Scheduling**: Schedule future calls
- [ ] **Group Call Analytics**: Call statistics and metrics
- [ ] **Breakout Rooms**: Sub-group discussions
- [ ] **Whiteboard Sharing**: Collaborative drawing
- [ ] **File Sharing**: Share files during calls

## 📞 **Support & Resources**

### **Agora Documentation**

- [React Native SDK](https://docs.agora.io/en/Video/API%20Reference/react_native/index.html)
- [API Reference](https://docs.agora.io/en/Video/API%20Reference/react_native/index.html)
- [Sample Code](https://github.com/AgoraIO-Community/React-Native-Voice)

### **Troubleshooting Resources**

- [Agora Community](https://www.agora.io/en/community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/agora)
- [GitHub Issues](https://github.com/AgoraIO-Community/React-Native-Voice/issues)

### **Testing Tools**

- [Agora Console](https://console.agora.io/)
- [Network Quality Test](https://webdemo.agora.io/agora-web-showcase/examples/Agora-Web-Tutorial-1to1/)
- [Device Compatibility](https://docs.agora.io/en/Video/API%20Reference/react_native/index.html)

---

**Note**: This implementation uses Agora's React Native SDK for high-quality video calling. For production use with many concurrent users, consider implementing token authentication and monitoring usage through the Agora Console.
