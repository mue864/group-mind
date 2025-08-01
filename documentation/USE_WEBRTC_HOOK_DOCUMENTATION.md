# useWebRTC Hook Documentation

## Overview

The `useWebRTC` hook provides a simplified interface for implementing WebRTC video and audio calls in React Native applications. It handles media streams, peer connections, and signaling server communication.

## Features

- Media stream management (audio/video)
- Peer connection handling
- Signaling server integration
- Participant tracking
- Media controls (mute/unmute, video on/off)
- Connection state management
- Automatic cleanup

## Installation

### Dependencies

```json
{
  "react-native-webrtc": "^x.x.x"
}
```

### Configuration

```typescript
const SIGNALING_URL = "ws://your-server:3001";
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  // Add your TURN servers here
];
```

## Usage

### Basic Implementation

```typescript
import { useWebRTC } from "@/hooks/useWebRTC";

function VideoCall() {
  const {
    participants,
    localStream,
    isMuted,
    isCameraOn,
    connected,
    error,
    toggleMute,
    toggleCamera,
    endCall,
  } = useWebRTC({
    roomId: "unique-room-id",
    userId: "user-id",
    userName: "User Name",
    callType: "video",
  });

  // Render your UI using the returned values
}
```

## API Reference

### Hook Parameters

```typescript
export type UseWebRTCOptions = {
  roomId: string; // Unique room identifier
  userId: string; // Current user's ID
  userName: string; // Display name
  callType: "audio" | "video"; // Call type
};
```

### Return Values

```typescript
{
  participants: WebRTCParticipant[];  // List of call participants
  localStream: MediaStream | null;     // Local media stream
  isMuted: boolean;                   // Audio mute state
  isCameraOn: boolean;                // Video enabled state
  connected: boolean;                 // Connection status
  error: string | null;               // Error state
  toggleMute: () => void;            // Toggle audio
  toggleCamera: () => void;          // Toggle video
  endCall: () => void;               // End call function
}
```

### Types

```typescript
export type WebRTCParticipant = {
  userId: string;
  userName: string;
  stream: MediaStream | null;
  isLocal: boolean;
};
```

## Implementation Details

### 1. Media Stream Setup

```typescript
const setupLocalStream = async () => {
  const stream = await mediaDevices.getUserMedia({
    audio: true,
    video: callType === "video",
  });

  // Configure tracks
  stream.getTracks().forEach((track) => {
    track.enabled = true;
  });

  return stream;
};
```

### 2. Peer Connection Management

The hook manages peer connections for each participant:

```typescript
const createPeerConnection = async (
  remoteUserId: string,
  isInitiator: boolean
) => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  // Add local tracks
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
  }

  // Handle remote stream
  pc.ontrack = (event) => {
    const stream = event.streams[0];
    // Update participants with new stream
  };

  // Handle negotiation
  if (isInitiator) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    // Send offer via signaling server
  }

  return pc;
};
```

### 3. Signaling Integration

```typescript
const connectToSignalingServer = () => {
  const ws = new WebSocket(SIGNALING_URL);

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "offer":
        await handleOffer(data);
        break;
      case "answer":
        await handleAnswer(data);
        break;
      case "ice-candidate":
        await handleIceCandidate(data);
        break;
    }
  };
};
```

### 4. Media Controls

```typescript
const toggleMute = () => {
  if (localStream) {
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  }
};

const toggleCamera = () => {
  if (localStream) {
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  }
};
```

## Best Practices

1. **Stream Management**:

   - Always cleanup streams when component unmounts
   - Handle track enable/disable states properly
   - Monitor track states

2. **Connection Handling**:

   - Implement proper error handling
   - Monitor connection states
   - Handle reconnection scenarios

3. **Performance**:
   - Use refs for values needed in callbacks
   - Implement proper cleanup
   - Handle component lifecycle

## Error Handling

The hook implements error handling for:

1. **Media Errors**:

   - Permission denials
   - Device unavailability
   - Track failures

2. **Connection Errors**:

   - Signaling server connection failures
   - Peer connection failures
   - ICE candidate errors

3. **State Errors**:
   - Invalid state transitions
   - Missing streams
   - Cleanup failures

## Cleanup

The hook handles cleanup on unmount:

```typescript
useEffect(() => {
  return () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Close peer connections
    Object.values(peerConnections).forEach((pc) => pc.close());

    // Close WebSocket
    if (ws.current) {
      ws.current.close();
    }
  };
}, []);
```

## Debugging

The hook provides detailed logging:

1. **Connection States**:

   - ICE connection state
   - Signaling state
   - Peer connection state

2. **Media States**:

   - Track states
   - Stream availability
   - Media constraints

3. **Error Information**:
   - Detailed error messages
   - State at error time
   - Recovery attempts

## Known Limitations

1. **Browser Support**:

   - Limited to environments with WebRTC support
   - Some features may not work in older versions

2. **Network Requirements**:

   - Requires stable network connection
   - May have issues with certain NAT configurations
   - TURN server recommended for reliable connectivity

3. **Resource Usage**:
   - High bandwidth usage for video
   - Significant battery usage
   - Memory usage with multiple peers

## Future Improvements

1. **Features**:

   - Screen sharing support
   - Recording capability
   - Bandwidth adaptation
   - More flexible media constraints

2. **Performance**:

   - Better connection recovery
   - Optimized media quality
   - Reduced resource usage

3. **Developer Experience**:
   - Better type safety
   - More configuration options
   - Better error handling

## Security Considerations

1. **Media Access**:

   - Proper permission handling
   - Clear user indicators
   - Secure device access

2. **Connection Security**:

   - Secure signaling server
   - Proper ICE server configuration
   - Connection encryption

3. **State Protection**:
   - Safe state transitions
   - Protected media access
   - Secure cleanup

## Troubleshooting

Common issues and solutions:

1. **No Local Stream**:

   - Check permissions
   - Verify device availability
   - Check media constraints

2. **Connection Issues**:

   - Verify signaling server
   - Check ICE servers
   - Monitor connection states

3. **Media Problems**:
   - Check track states
   - Verify stream handling
   - Monitor media events
