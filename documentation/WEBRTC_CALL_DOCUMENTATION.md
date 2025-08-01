# WebRTC Call Implementation Documentation

## Overview

The `WebRTCCall` component implements peer-to-peer video and audio calling functionality using WebRTC technology. It supports both video and audio-only calls with multiple participants in a room-based system.

## Features

- Real-time video and audio streaming
- Support for multiple participants
- Toggle audio mute/unmute
- Toggle video on/off (for video calls)
- Local video preview
- Grid layout for remote participants
- Connection state monitoring
- Debug information in development mode

## Technical Architecture

### Core Technologies

- `react-native-webrtc`: Provides WebRTC implementation for React Native
- WebSocket: Used for signaling server communication
- NativeWind: Used for styling (Tailwind CSS for React Native)

### Component Structure

```typescript
interface WebRTCCallProps {
  roomId: string; // Unique identifier for the call room
  userId: string; // Current user's ID
  userName: string; // Current user's display name
  callType: "audio" | "video"; // Type of call
  onEndCall: () => void; // Callback when call ends
}
```

### State Management

```typescript
// Stream States
const [localStream, setLocalStream] = useState<MediaStream | null>(null);
const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
  new Map()
);

// UI States
const [participants, setParticipants] = useState<
  { id: string; name: string }[]
>([]);
const [isAudioEnabled, setIsAudioEnabled] = useState(true);
const [isVideoEnabled, setIsVideoEnabled] = useState(callType === "video");
const [connectionState, setConnectionState] = useState<string>("connecting");

// Refs
const wsRef = useRef<WebSocket | null>(null);
const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
const localStreamRef = useRef<MediaStream | null>(null);
```

## Implementation Details

### 1. Call Initialization

```typescript
const initializeCall = async () => {
  // 1. Get local media stream
  const stream = await setupLocalStream();

  // 2. Store stream in state and ref
  localStreamRef.current = stream;
  setLocalStream(stream);

  // 3. Connect to signaling server
  connectToSignalingServer();
};
```

### 2. Media Stream Setup

```typescript
const setupLocalStream = async () => {
  const mediaConstraints = {
    audio: true,
    video: callType === "video",
  };

  const stream = await mediaDevices.getUserMedia(mediaConstraints);
  // Configure tracks and enable them
  stream.getTracks().forEach((track) => (track.enabled = true));

  return stream;
};
```

### 3. Peer Connection Management

The component manages peer connections for each participant:

- Creates new RTCPeerConnection when participants join
- Handles offer/answer exchange
- Manages ICE candidates
- Monitors connection states
- Handles stream track events

### 4. Signaling Process

1. **Connection Establishment**:

   ```typescript
   wsRef.current = new WebSocket(SIGNALING_URL);
   ```

2. **Message Types**:
   - `welcome`: Initial room state
   - `participant-joined`: New participant notification
   - `existing-participants`: List of current participants
   - `offer`: WebRTC offer
   - `answer`: WebRTC answer
   - `ice-candidate`: ICE candidates
   - `participant-left`: Participant disconnection

### 5. Video Rendering

The component implements two main video rendering functions:

1. **Local Video Preview**:

   ```typescript
   const renderLocalVideo = () => (
     <View className="absolute top-4 right-4 w-[120px] h-[160px] z-10">
       <RTCView
         streamURL={localStreamRef.current.toURL()}
         mirror={true}
         objectFit="cover"
       />
     </View>
   );
   ```

2. **Remote Video Grid**:
   ```typescript
   const renderRemoteVideos = () => (
     <View className="flex-1 flex-row flex-wrap">
       {remoteStreamArray.map(([peerId, stream]) => (
         <RTCView key={peerId} streamURL={stream.toURL()} objectFit="cover" />
       ))}
     </View>
   );
   ```

## UI Components

### 1. Control Buttons

- Audio toggle
- Video toggle (in video calls)
- End call button

### 2. Status Information

- Connection state
- Participant count
- Debug information (in development)

## Best Practices

1. **Stream Management**:

   - Always cleanup streams when component unmounts
   - Enable/disable tracks instead of recreating them
   - Monitor track states for debugging

2. **Connection Handling**:

   - Store peer connections in a ref for persistence
   - Clean up connections properly on participant leave
   - Monitor connection states for reliability

3. **Performance Optimization**:
   - Use refs for values needed in callbacks
   - Implement proper cleanup
   - Handle component lifecycle properly

## Error Handling

The component implements comprehensive error handling:

1. **Media Errors**:

   - Permission denials
   - Device unavailability
   - Stream initialization failures

2. **Connection Errors**:

   - WebSocket connection failures
   - Peer connection failures
   - ICE candidate errors

3. **Stream Errors**:
   - Track failures
   - Remote stream disconnections
   - Media state changes

## Debugging

In development mode (`__DEV__`), the component displays debugging information:

- Room ID
- User ID
- Participant count
- Remote stream count
- Connection state

## Usage Example

```typescript
import WebRTCCall from "@/components/WebRTCCall";

function CallScreen() {
  return (
    <WebRTCCall
      roomId="unique-room-id"
      userId="current-user-id"
      userName="User Name"
      callType="video"
      onEndCall={() => {
        // Handle call end
      }}
    />
  );
}
```

## Configuration

The component uses configuration from `constants/index.ts`:

```typescript
export const WEBRTC_CONFIG = {
  SIGNALING_URL: "ws://your-signaling-server",
  ICE_SERVERS: [
    { urls: "stun:stun.l.google.com:19302" },
    // Add your TURN servers here
  ],
};
```

## Known Limitations

1. **Browser Support**:

   - Limited to environments with WebRTC support
   - Some features may not work in older browsers

2. **Network Requirements**:

   - Requires stable network connection
   - May have issues with certain NAT configurations
   - TURN server recommended for reliable connectivity

3. **Resource Usage**:
   - High bandwidth usage for video calls
   - Significant battery usage on mobile devices
   - Memory usage increases with participant count

## Future Improvements

1. **Features**:

   - Screen sharing support
   - Recording capability
   - Bandwidth adaptation
   - More flexible layout options

2. **Performance**:

   - Optimize video quality settings
   - Implement bandwidth controls
   - Better handling of poor network conditions

3. **User Experience**:
   - Add call quality indicators
   - Implement reconnection handling
   - Add more user feedback mechanisms

## Troubleshooting

Common issues and solutions:

1. **No Local Video**:

   - Check camera permissions
   - Verify device availability
   - Check track enabled state

2. **No Remote Video**:

   - Verify peer connection state
   - Check ICE candidate exchange
   - Verify remote stream reception

3. **Connection Issues**:
   - Check signaling server connection
   - Verify ICE server configuration
   - Check network connectivity

## Security Considerations

1. **Media Access**:

   - Always request explicit permissions
   - Handle permission denials gracefully
   - Clear indicators when media is active

2. **Data Protection**:

   - Use secure WebSocket connections
   - Implement proper room access control
   - Protect signaling server endpoints

3. **Privacy**:
   - Clear indication of media state
   - Proper cleanup of media streams
   - Secure handling of participant information
