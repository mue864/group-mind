# GroupMind WebRTC Call Feature

This document explains how to set up and use the new WebRTC-based call feature that allows audio and video calls between mobile app users and web users.

## 🚀 Features

- **Audio & Video Calls**: Support for both audio-only and video calls
- **Cross-Platform**: Works on mobile (React Native) and web browsers
- **Real-time Communication**: Uses WebRTC for peer-to-peer connections
- **Participant Management**: Up to 4 participants per call (configurable)
- **Call Controls**: Mute, video toggle, camera switch, end call
- **Call Invitations**: Real-time call notifications in group chats
- **Firebase Integration**: Uses Firebase Realtime Database for signaling

## 📁 File Structure

```
├── services/
│   └── webrtcService.ts          # Core WebRTC service
├── hooks/
│   └── useWebRTC.ts              # React hook for WebRTC state
├── components/
│   ├── VideoCall.tsx             # Main video call component
│   └── CallInvitation.tsx        # Call invitation component
├── app/(groups)/[groupId]/
│   ├── call.tsx                  # Call screen
│   └── sessions.tsx              # Updated sessions screen
└── web/
    └── index.html                # Web interface
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

The following packages are already included in your `package.json`:

- `expo-av` - For video/audio handling
- `expo-camera` - For camera access
- `firebase` - For signaling and real-time updates

### 2. Signaling Options

You have **3 signaling options** to choose from:

#### Option A: Firebase Firestore (Recommended - Free Tier)
- Uses your existing Firestore database
- No additional costs
- Real-time listeners work well
- Already implemented in `services/webrtcService.ts`

#### Option B: WebSocket Server (Free & Self-Hosted)
- Complete control over signaling
- No authentication issues
- Free to host
- Implementation in `services/webrtcWebSocketService.ts`

#### Option C: Supabase with Shared Auth
- Generous free tier
- Can share authentication tokens
- More complex setup

### 3. Firebase Configuration (Option A)

Your Firebase project is already configured. The WebRTC service uses:
- **Firestore**: For signaling (offers, answers, ICE candidates) and participant tracking
- **No Realtime Database needed** (updated to work with free tier)

### 4. WebSocket Server Setup (Option B)

If you choose the WebSocket signaling option:

1. **Install Dependencies**:
```bash
cd signaling-server
npm install
```

2. **Start the Server**:
```bash
npm start
# or for development
npm run dev
```

3. **Update Service URL**:
In your app, update the signaling server URL:
```typescript
import webrtcWebSocketService from '@/services/webrtcWebSocketService';

// Set your server URL
webrtcWebSocketService.setSignalingServerUrl('ws://your-server.com:3001');
```

4. **Deploy the Server**:
- **Railway**: Free tier available
- **Render**: Free tier available
- **Heroku**: Free tier available
- **VPS**: Any VPS provider

### 5. WebRTC Polyfills (React Native)

```javascript
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  "react-native-webrtc": "react-native-webrtc",
};

module.exports = config;
```

### 4. Permissions

Add the following permissions to your app configuration:

**Android (`app.json`)**:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ]
    }
  }
}
```

**iOS (`app.json`)**:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "This app needs access to camera for video calls",
        "NSMicrophoneUsageDescription": "This app needs access to microphone for calls"
      }
    }
  }
}
```

## 🎯 Usage

### Starting a Call

1. **From Mobile App**:

   - Navigate to a group
   - Go to "Sessions" tab
   - Tap "Start Video Call" or "Start Audio Call"

2. **From Web Browser**:
   - Open `web/index.html`
   - Enter Group ID and your name
   - Select call type (audio/video)
   - Click "Join Call"

### Call Controls

- **🎤 Mute/Unmute**: Toggle microphone
- **📹 Video On/Off**: Toggle camera (video calls only)
- **🔄 Switch Camera**: Switch between front/back camera
- **📞 End Call**: End the call for everyone

### Call Invitations

The `CallInvitation` component can be added to group chats to show active calls:

```tsx
import CallInvitation from "@/components/CallInvitation";

// In your group chat component
<CallInvitation groupId={groupId} />;
```

## 🔧 Configuration

### Participant Limit

Change the maximum participants by modifying the `maxParticipants` prop:

```tsx
<VideoCall
  roomId={groupId}
  callType="video"
  onEndCall={handleEndCall}
  maxParticipants={6} // Default is 4
/>
```

### ICE Servers

Modify the ICE servers in `services/webrtcService.ts`:

```typescript
private rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add your TURN servers here for better connectivity
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    }
  ],
};
```

## 🌐 Web Interface

The web interface (`web/index.html`) provides:

- Simple join form with Group ID and name
- Real-time video/audio display
- Call controls matching mobile app
- Responsive design for different screen sizes

### Deploying Web Interface

1. **Static Hosting**: Deploy to Netlify, Vercel, or GitHub Pages
2. **Firebase Hosting**: Add to your Firebase project
3. **Local Development**: Open `web/index.html` in a browser

## 🔒 Security Considerations

1. **Room Access**: Currently, anyone with a Group ID can join. Consider adding authentication.
2. **TURN Servers**: For production, add TURN servers for better connectivity through firewalls.
3. **Rate Limiting**: Implement rate limiting for signaling to prevent abuse.

## 🐛 Troubleshooting

### Common Issues

1. **Camera/Microphone Not Working**:

   - Check browser permissions
   - Ensure HTTPS (required for getUserMedia)
   - Verify device permissions on mobile

2. **Connection Issues**:

   - Check internet connectivity
   - Verify Firebase configuration
   - Add TURN servers for better connectivity

3. **Video Not Displaying**:
   - Check if video tracks are enabled
   - Verify WebRTC polyfills are loaded
   - Check browser console for errors

### Debug Mode

Enable debug logging in `services/webrtcService.ts`:

```typescript
// Add this to the constructor
if (__DEV__) {
  console.log("WebRTC Service initialized");
}
```

## 📱 Testing

### Mobile Testing

1. Run the app on physical devices (WebRTC doesn't work well in simulators)
2. Test on both iOS and Android
3. Test with different network conditions

### Web Testing

1. Test in different browsers (Chrome, Firefox, Safari, Edge)
2. Test with different devices (desktop, tablet, mobile)
3. Test with different network conditions

### Cross-Platform Testing

1. Start call from mobile, join from web
2. Start call from web, join from mobile
3. Test with multiple participants

## 🚀 Performance Optimization

1. **Video Quality**: Adjust video constraints based on device capabilities
2. **Bandwidth**: Implement bandwidth estimation and quality adaptation
3. **Memory**: Properly clean up streams and connections
4. **Battery**: Optimize for mobile battery usage

## 🔄 Future Enhancements

- [ ] Screen sharing
- [ ] Recording capabilities
- [ ] Background blur/filters
- [ ] Virtual backgrounds
- [ ] Call recording
- [ ] Push notifications for incoming calls
- [ ] Call scheduling improvements
- [ ] Group call analytics

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review Firebase console for errors
3. Check browser console for WebRTC errors
4. Test with different devices and networks

---

**Note**: This implementation uses Firebase Realtime Database for signaling. For production use with many concurrent users, consider using a dedicated WebRTC signaling server or services like Twilio, Agora, or Daily.co.
