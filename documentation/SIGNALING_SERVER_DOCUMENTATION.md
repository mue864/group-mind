# WebRTC Signaling Server Documentation

## Overview

The signaling server (`server.js`) is a WebSocket-based server that facilitates the WebRTC peer connection establishment between clients. It handles participant management, room coordination, and message relay for WebRTC signaling.

## Features

- Room-based participant management
- Real-time message relay
- Connection state monitoring
- Automatic cleanup of dead connections
- Health check endpoints
- Graceful shutdown handling

## Technical Architecture

### Core Technologies

- `ws`: WebSocket server implementation
- `http`: Node.js HTTP server for health checks
- Native Node.js modules for server functionality

### Server Structure

```javascript
const WebSocket = require("ws");
const http = require("http");
const url = require("url");

const server = http.createServer();
const wss = new WebSocket.Server({ server });
```

### Data Structures

```javascript
// Active connections and rooms
const rooms = new Map(); // roomId -> Set of WebSocket connections
const connections = new Map(); // WebSocket -> { roomId, userId, userName, joinedAt }
```

## Implementation Details

### 1. Connection Management

The server manages WebSocket connections with participant information:

```javascript
wss.on("connection", (ws, req) => {
  const { query } = url.parse(req.url, true);
  const { roomId, userId, userName } = query;

  // Store connection info
  connections.set(ws, {
    roomId,
    userId,
    userName,
    joinedAt: Date.now(),
  });

  // Add to room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(ws);
});
```

### 2. Message Types and Handling

The server handles various message types for WebRTC signaling:

1. **Offer Messages**:

   ```javascript
   case 'offer':
     forwardToPeer(roomId, data.targetUserId, {
       type: 'offer',
       fromUserId: userId,
       sdp: data.sdp
     });
     break;
   ```

2. **Answer Messages**:

   ```javascript
   case 'answer':
     forwardToPeer(roomId, data.targetUserId, {
       type: 'answer',
       fromUserId: userId,
       sdp: data.sdp
     });
     break;
   ```

3. **ICE Candidate Messages**:
   ```javascript
   case 'ice-candidate':
     forwardToPeer(roomId, data.targetUserId, {
       type: 'ice-candidate',
       fromUserId: userId,
       candidate: data.candidate
     });
     break;
   ```

### 3. Room Management

The server implements room-based participant management:

```javascript
function getRoomParticipants(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];

  const participants = [];
  // Clean up dead connections
  const deadConnections = [];

  for (const ws of room) {
    if (ws.readyState !== WebSocket.OPEN) {
      deadConnections.push(ws);
      continue;
    }

    const connection = connections.get(ws);
    if (connection) {
      participants.push({
        id: connection.userId,
        name: connection.userName,
        joinedAt: connection.joinedAt,
      });
    }
  }

  // Remove dead connections
  deadConnections.forEach((deadWs) => {
    room.delete(deadWs);
    connections.delete(deadWs);
  });

  return participants;
}
```

### 4. Message Broadcasting

The server provides functions for message broadcasting:

```javascript
function broadcastToRoom(roomId, message, excludeWs = null) {
  const room = rooms.get(roomId);
  if (!room) return;

  const messageStr = JSON.stringify(message);
  let sentCount = 0;

  for (const ws of room) {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(messageStr);
        sentCount++;
      } catch (error) {
        console.error("Error broadcasting to WebSocket:", error);
      }
    }
  }
}
```

### 5. Connection Cleanup

The server implements automatic cleanup of dead connections:

```javascript
setInterval(() => {
  const deadConnections = [];

  for (const [ws, connection] of connections.entries()) {
    if (ws.readyState !== WebSocket.OPEN) {
      deadConnections.push(ws);
    }
  }

  deadConnections.forEach((ws) => {
    handleDisconnection(ws);
  });
}, 60000); // Clean up every minute
```

## API Endpoints

### 1. WebSocket Connection

```
ws://server:port?roomId={roomId}&userId={userId}&userName={userName}
```

Required query parameters:

- `roomId`: Unique room identifier
- `userId`: Unique user identifier
- `userName`: Display name of the user

### 2. Health Check Endpoints

```
GET /health
```

Returns server status and room information:

```javascript
{
  status: 'ok',
  rooms: <number of active rooms>,
  connections: <number of active connections>,
  roomDetails: [
    {
      roomId: string,
      participantCount: number,
      participants: Array<{
        id: string,
        name: string,
        joinedAt: number
      }>
    }
  ],
  timestamp: string
}
```

```
GET /rooms
```

Returns active room information:

```javascript
{
  rooms: [
    {
      roomId: string,
      participantCount: number,
      participants: Array<{
        id: string,
        name: string,
        joinedAt: number
      }>
    }
  ]
}
```

## Error Handling

The server implements comprehensive error handling:

1. **Connection Errors**:

   - Invalid parameters
   - Duplicate connections
   - WebSocket errors

2. **Message Errors**:

   - Invalid message format
   - Missing target user
   - Room not found

3. **Cleanup Handling**:
   - Dead connection removal
   - Room cleanup
   - Participant notification

## Best Practices

1. **Connection Management**:

   - Validate connection parameters
   - Handle duplicate connections
   - Clean up dead connections
   - Proper error handling

2. **Message Handling**:

   - Validate message format
   - Ensure proper message forwarding
   - Handle connection states
   - Log important events

3. **Performance**:
   - Efficient room management
   - Regular cleanup intervals
   - Memory leak prevention
   - Connection monitoring

## Security Considerations

1. **Connection Validation**:

   - Validate all incoming parameters
   - Prevent duplicate connections
   - Handle malformed requests

2. **Message Validation**:

   - Validate message format
   - Verify target users exist
   - Prevent message spoofing

3. **Resource Protection**:
   - Implement rate limiting
   - Monitor room sizes
   - Clean up unused resources

## Deployment

### Environment Variables

```javascript
const PORT = process.env.PORT || 3001;
```

### Starting the Server

```bash
node server.js
```

### Docker Support

```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

## Monitoring and Debugging

1. **Server Logs**:

   - Connection events
   - Message forwarding
   - Error occurrences
   - Cleanup operations

2. **Health Checks**:

   - Active connections
   - Room statistics
   - Server status
   - Resource usage

3. **Performance Metrics**:
   - Connection count
   - Message throughput
   - Room sizes
   - Cleanup efficiency

## Future Improvements

1. **Features**:

   - Authentication support
   - Room access control
   - Message encryption
   - Connection metrics

2. **Performance**:

   - Load balancing support
   - Redis for state management
   - Better cleanup strategies
   - Connection pooling

3. **Monitoring**:
   - Better logging
   - Metrics collection
   - Alert system
   - Performance tracking

## Troubleshooting

Common issues and solutions:

1. **Connection Issues**:

   - Check WebSocket URL format
   - Verify query parameters
   - Check server logs
   - Verify client state

2. **Message Problems**:

   - Check message format
   - Verify target users
   - Check room state
   - Monitor logs

3. **Performance Issues**:
   - Monitor connection count
   - Check cleanup efficiency
   - Verify resource usage
   - Review log patterns
