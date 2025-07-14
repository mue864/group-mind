const WebSocket = require('ws');
const http = require('http');
const url = require('url');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store active connections and rooms
const rooms = new Map(); // roomId -> Set of WebSocket connections
const connections = new Map(); // WebSocket -> { roomId, userId, userName }

console.log('WebRTC Signaling Server starting...');

wss.on('connection', (ws, req) => {
    const { query } = url.parse(req.url, true);
    const { roomId, userId, userName } = query;

    if (!roomId || !userId || !userName) {
        ws.close(1008, 'Missing required parameters');
        return;
    }

    console.log(`User ${userName} (${userId}) joining room ${roomId}`);

    // Store connection info
    connections.set(ws, { roomId, userId, userName });

    // Add to room
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(ws);

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        roomId,
        userId,
        participants: getRoomParticipants(roomId)
    }));

    // Notify other participants
    broadcastToRoom(roomId, {
        type: 'participant-joined',
        userId,
        userName,
        participants: getRoomParticipants(roomId)
    }, ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        handleDisconnection(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        handleDisconnection(ws);
    });
});

function handleMessage(ws, data) {
    const connection = connections.get(ws);
    if (!connection) return;

    const { roomId, userId } = connection;

    switch (data.type) {
        case 'offer':
            // Forward offer to specific peer
            forwardToPeer(roomId, data.targetUserId, {
                type: 'offer',
                fromUserId: userId,
                sdp: data.sdp
            });
            break;

        case 'answer':
            // Forward answer to specific peer
            forwardToPeer(roomId, data.targetUserId, {
                type: 'answer',
                fromUserId: userId,
                sdp: data.sdp
            });
            break;

        case 'ice-candidate':
            // Forward ICE candidate to specific peer
            forwardToPeer(roomId, data.targetUserId, {
                type: 'ice-candidate',
                fromUserId: userId,
                candidate: data.candidate
            });
            break;

        case 'participant-update':
            // Update participant status (mute, video, etc.)
            broadcastToRoom(roomId, {
                type: 'participant-update',
                userId,
                updates: data.updates
            });
            break;

        case 'ping':
            // Respond to ping
            ws.send(JSON.stringify({ type: 'pong' }));
            break;

        default:
            console.log('Unknown message type:', data.type);
    }
}

function handleDisconnection(ws) {
    const connection = connections.get(ws);
    if (!connection) return;

    const { roomId, userId, userName } = connection;

    console.log(`User ${userName} (${userId}) leaving room ${roomId}`);

    // Remove from room
    const room = rooms.get(roomId);
    if (room) {
        room.delete(ws);
        if (room.size === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} is now empty`);
        }
    }

    // Remove connection
    connections.delete(ws);

    // Notify other participants
    broadcastToRoom(roomId, {
        type: 'participant-left',
        userId,
        userName,
        participants: getRoomParticipants(roomId)
    });
}

function getRoomParticipants(roomId) {
    const room = rooms.get(roomId);
    if (!room) return [];

    const participants = [];
    for (const ws of room) {
        const connection = connections.get(ws);
        if (connection) {
            participants.push({
                id: connection.userId,
                name: connection.userName
            });
        }
    }
    return participants;
}

function broadcastToRoom(roomId, message, excludeWs = null) {
    const room = rooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    for (const ws of room) {
        if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
            ws.send(messageStr);
        }
    }
}

function forwardToPeer(roomId, targetUserId, message) {
    const room = rooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    for (const ws of room) {
        const connection = connections.get(ws);
        if (connection && connection.userId === targetUserId && ws.readyState === WebSocket.OPEN) {
            ws.send(messageStr);
            break;
        }
    }
}

// Health check endpoint
server.on('request', (req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            rooms: rooms.size,
            connections: connections.size,
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`WebRTC Signaling Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    wss.close(() => {
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
}); 