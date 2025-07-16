# Sessions and Join Links Documentation

## Overview

This document outlines the refactored sessions functionality in the Group Mind app, which now properly integrates with Agora video calling and includes comprehensive join link functionality.

## Key Features

### ✅ **Agora Integration**

- Proper channel management for Agora calls
- Unique channel name generation
- Real-time call status tracking
- Seamless navigation to video/audio calls

### ✅ **Join Link System**

- Automatic join link generation for all calls
- Deep linking support for call invitations
- Share functionality for call links
- Link storage in Firestore

### ✅ **Modern UI/UX**

- Consistent design with other app tabs
- Gradient backgrounds and modern styling
- Responsive layout with proper spacing
- Intuitive call type selection

### ✅ **Real-time Updates**

- Live active calls display
- Scheduled calls with countdown
- Real-time participant tracking
- Call status updates

## Architecture

### Data Flow

```
User Action → Firebase → Agora → UI Update
     ↓           ↓         ↓         ↓
Start Call → Create Doc → Join Channel → Show Call
Schedule → Save to DB → Generate Link → Display
Join Call → Update Status → Connect → Enter Call
```

### Firestore Collections

#### 1. `activeCalls` Collection

```typescript
interface ActiveCall {
  id: string;
  groupId: string;
  channelName: string; // Agora channel name
  callType: "audio" | "video";
  startedAt: Timestamp;
  createdBy: string;
  createdByUserName: string;
  participants: string[];
  status: "active" | "ended";
  joinLink?: string; // Generated join link
  groupName: string;
}
```

#### 2. `scheduledCalls` Collection

```typescript
interface ScheduledCall {
  id: string;
  groupId: string;
  title: string;
  channelName: string; // Pre-generated Agora channel
  scheduledTime: Timestamp;
  createdBy: string;
  createdByUserName: string;
  status: "scheduled" | "in-progress" | "completed";
  callType: "audio" | "video";
  joinLink?: string; // Pre-generated join link
  participants: string[];
  maxParticipants?: number;
  groupName: string;
}
```

## Join Link System

### Link Generation

```typescript
const generateJoinLink = (
  channelName: string,
  callType: "audio" | "video"
): string => {
  const baseUrl = "groupmind://call";
  return `${baseUrl}?channel=${channelName}&type=${callType}&groupId=${groupID}`;
};
```

### Link Storage

Join links are stored in two places:

1. **Firestore Documents**: Each call document contains a `joinLink` field
2. **Deep Link Parameters**: Links include channel name, call type, and group ID

### Link Format

```
groupmind://call?channel=group-123-1703123456789-abc123&type=video&groupId=123
```

**Components:**

- `groupmind://call` - App scheme for deep linking
- `channel` - Unique Agora channel name
- `type` - Call type (audio/video)
- `groupId` - Group identifier

### Link Sharing

```typescript
const handleShareLink = async (joinLink: string, callTitle: string) => {
  const { Share } = await import("react-native");
  await Share.share({
    message: `Join the call "${callTitle}" in ${groupName}:\n\n${joinLink}`,
    title: `Join ${callTitle}`,
  });
};
```

## Agora Channel Management

### Channel Name Generation

```typescript
const generateChannelName = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `group-${groupID}-${timestamp}-${random}`;
};
```

**Format:** `group-{groupId}-{timestamp}-{randomString}`

**Example:** `group-123-1703123456789-abc123`

### Channel Lifecycle

1. **Creation**: Generated when call is started/scheduled
2. **Storage**: Saved in Firestore document
3. **Joining**: Used to connect to Agora channel
4. **Cleanup**: Removed when call ends

## Session Types

### 1. Immediate Calls

**Flow:**

1. User clicks "Start Video/Audio Call"
2. Generate unique channel name
3. Create `activeCalls` document
4. Generate join link
5. Navigate to call screen

**Code:**

```typescript
const handleStartCall = async (type: "audio" | "video") => {
  const channelName = generateChannelName();
  const callRef = await addDoc(collection(db, "activeCalls"), {
    groupId: groupID,
    channelName: channelName,
    callType: type,
    // ... other fields
  });

  const joinLink = generateJoinLink(channelName, type);
  await updateDoc(doc(db, "activeCalls", callRef.id), {
    joinLink: joinLink,
  });

  router.push(`/(groups)/${groupID}/call?channel=${channelName}&type=${type}`);
};
```

### 2. Scheduled Calls

**Flow:**

1. User schedules call with title, date, time
2. Generate channel name and join link
3. Create `scheduledCalls` document
4. Display in scheduled calls list
5. Allow joining when time comes

**Code:**

```typescript
const handleScheduleCall = async () => {
  const channelName = generateChannelName();
  const joinLink = generateJoinLink(channelName, callType);

  await addDoc(collection(db, "scheduledCalls"), {
    title: callTitle,
    channelName: channelName,
    joinLink: joinLink,
    scheduledTime: Timestamp.fromDate(scheduledDateTime),
    callType: callType,
    // ... other fields
  });
};
```

### 3. Joining Calls

**Flow:**

1. User clicks "Join Call"
2. Update call status (if scheduled)
3. Navigate to call screen with channel parameters
4. Connect to Agora channel

**Code:**

```typescript
const handleJoinCall = async (call: ScheduledCall | ActiveCall) => {
  if ("status" in call && call.status === "scheduled") {
    await updateDoc(doc(db, "scheduledCalls", call.id), {
      status: "in-progress",
    });
  }

  router.push(
    `/(groups)/${groupID}/call?channel=${call.channelName}&type=${call.callType}`
  );
};
```

## UI Components

### 1. Active Calls Section

**Features:**

- Real-time display of ongoing calls
- "LIVE" status indicator
- Join and share buttons
- Call type icons

**Styling:**

```typescript
className =
  "bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-3 border border-green-200";
```

### 2. Quick Start Section

**Features:**

- Instant video/audio call buttons
- Loading states
- Modern gradient design

### 3. Schedule Form

**Features:**

- Collapsible form
- Date/time input fields
- Call type selection
- Validation

### 4. Scheduled Calls List

**Features:**

- Chronological ordering
- "Starting Soon" indicators
- Join and share functionality
- Empty state design

## Real-time Features

### Live Updates

```typescript
// Active calls listener
const q = query(
  collection(db, "activeCalls"),
  where("groupId", "==", groupID),
  where("status", "==", "active")
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const calls = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ActiveCall[];
  setActiveCalls(calls);
});
```

### Starting Soon Detection

```typescript
const isCallStartingSoon = (scheduledTime: Timestamp): boolean => {
  const now = new Date();
  const callTime = scheduledTime.toDate();
  const diffMinutes = (callTime.getTime() - now.getTime()) / (1000 * 60);
  return diffMinutes <= 5 && diffMinutes > 0;
};
```

## Navigation Integration

### Call Screen Parameters

The call screen now receives:

- `channel`: Agora channel name
- `type`: Call type (audio/video)
- `groupId`: Group identifier

### Deep Link Handling

```typescript
// In call screen
const { groupId, channel, type } = useLocalSearchParams();

// Validate parameters
if (!groupId || !channel) {
  Alert.alert("Invalid Call", "Call parameters are missing.");
  return;
}
```

## Error Handling

### Validation

1. **User Authentication**: Check if user is signed in
2. **Required Fields**: Validate title, date, time for scheduling
3. **Future Dates**: Ensure scheduled calls are in the future
4. **Parameters**: Validate channel and group ID

### Error Messages

```typescript
Toast.show({
  type: "error",
  text1: "Error",
  text2: "Please enter a title, date, and time for the call",
});
```

## Performance Optimizations

### 1. Efficient Queries

```typescript
// Use compound queries for better performance
const q = query(
  collection(db, "scheduledCalls"),
  where("groupId", "==", groupID),
  where("status", "in", ["scheduled", "in-progress"])
);
```

### 2. Lazy Loading

```typescript
// Import Share API only when needed
const { Share } = await import("react-native");
```

### 3. Optimistic Updates

```typescript
// Update UI immediately, then sync with server
setScheduledCalls((prev) => [...prev, newCall]);
```

## Security Considerations

### 1. Channel Security

- Unique channel names prevent conflicts
- Timestamp-based generation ensures uniqueness
- Random strings add additional security

### 2. Access Control

- Only group members can see calls
- User authentication required for all actions
- Proper validation of user permissions

### 3. Data Validation

- Input sanitization for call titles
- Date/time validation
- Parameter validation for navigation

## Future Enhancements

### 1. Push Notifications

```typescript
// Send notifications when calls start
const sendCallNotification = async (call: ScheduledCall) => {
  // Implementation for push notifications
};
```

### 2. Call Recording

```typescript
// Add recording functionality
const startRecording = async () => {
  // Agora recording implementation
};
```

### 3. Screen Sharing

```typescript
// Enable screen sharing in calls
const enableScreenShare = async () => {
  // Screen sharing implementation
};
```

### 4. Call Analytics

```typescript
// Track call metrics
const trackCallMetrics = async (callData: CallMetrics) => {
  // Analytics implementation
};
```

## Testing

### Unit Tests

```typescript
describe("Session Management", () => {
  test("should generate unique channel names", () => {
    const channel1 = generateChannelName();
    const channel2 = generateChannelName();
    expect(channel1).not.toBe(channel2);
  });

  test("should generate valid join links", () => {
    const link = generateJoinLink("test-channel", "video");
    expect(link).toContain("groupmind://call");
    expect(link).toContain("channel=test-channel");
  });
});
```

### Integration Tests

```typescript
describe("Call Flow", () => {
  test("should create active call and navigate to call screen", async () => {
    // Test complete call flow
  });

  test("should schedule call and allow joining", async () => {
    // Test scheduling flow
  });
});
```

## Conclusion

The refactored sessions functionality provides a robust, user-friendly interface for managing group calls with proper Agora integration and comprehensive join link support. The system is designed to be scalable, secure, and maintainable while providing an excellent user experience.
