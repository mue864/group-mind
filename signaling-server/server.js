const WebSocket = require('ws');
const http = require('http');
const url = require('url');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store active connections and rooms
const rooms = new Map(); // roomId -> Set of WebSocket connections
const connections = new Map(); // WebSocket -> { roomId, userId, userName, joinedAt }

console.log('WebRTC Signaling Server starting...');

wss.on('connection', (ws, req) => {
    const { query } = url.parse(req.url, true);
    const { roomId, userId, userName } = query;

    if (!roomId || !userId || !userName) {
        ws.close(1008, 'Missing required parameters');
        return;
    }

    console.log(`User ${userName} (${userId}) joining room ${roomId}`);

    // Check if user is already in the room (prevent duplicates)
    const existingConnection = findExistingConnection(roomId, userId);
    if (existingConnection) {
        console.log(`User ${userId} already exists in room ${roomId}, closing old connection`);
        existingConnection.close(1000, 'Duplicate connection');
    }

    // Store connection info with timestamp
    connections.set(ws, {
        roomId,
        userId,
        userName,
        joinedAt: Date.now()
    });

    // Add to room
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(ws);

    // First, notify existing participants about the new joiner
    broadcastToRoom(roomId, {
        type: 'participant-joined',
        userId,
        userName,
        participants: getRoomParticipants(roomId)
    }, ws);

    // Small delay to ensure the above message is processed, then send welcome
    setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'welcome',
                roomId,
                userId,
                participants: getRoomParticipants(roomId)
            }));

            // Send existing participants list to new joiner
            const participants = getRoomParticipants(roomId);
            if (participants.length > 1) {
                ws.send(JSON.stringify({
                    type: 'existing-participants',
                    participants: participants.filter(p => p.id !== userId)
                }));
            }
        }
    }, 100);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`WebSocket closed: ${code} - ${reason}`);
        handleDisconnection(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        handleDisconnection(ws);
    });

    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
        } else {
            clearInterval(pingInterval);
        }
    }, 30000);

    ws.on('close', () => clearInterval(pingInterval));
});

function findExistingConnection(roomId, userId) {
    const room = rooms.get(roomId);
    if (!room) return null;

    for (const ws of room) {
        const connection = connections.get(ws);
        if (connection && connection.userId === userId) {
            return ws;
        }
    }
    return null;
}

function handleMessage(ws, data) {
    const connection = connections.get(ws);
    if (!connection) {
        console.error('No connection found for WebSocket');
        return;
    }

    const { roomId, userId } = connection;

    console.log(`Received message from ${userId}:`, data.type);

    switch (data.type) {
        case 'offer':
            // Forward offer to specific peer
            const offerSent = forwardToPeer(roomId, data.targetUserId, {
                type: 'offer',
                fromUserId: userId,
                sdp: data.sdp
            });
            console.log(`Offer forwarding ${offerSent ? 'successful' : 'failed'} - from ${userId} to ${data.targetUserId}`);
            break;

        case 'answer':
            // Forward answer to specific peer
            const answerSent = forwardToPeer(roomId, data.targetUserId, {
                type: 'answer',
                fromUserId: userId,
                sdp: data.sdp
            });
            console.log(`Answer forwarding ${answerSent ? 'successful' : 'failed'} - from ${userId} to ${data.targetUserId}`);
            break;

        case 'ice-candidate':
            // Forward ICE candidate to specific peer
            const candidateSent = forwardToPeer(roomId, data.targetUserId, {
                type: 'ice-candidate',
                fromUserId: userId,
                candidate: data.candidate
            });
            console.log(`ICE candidate forwarding ${candidateSent ? 'successful' : 'failed'} - from ${userId} to ${data.targetUserId}`);
            break;

        case 'call-ended':
            // Forward call end message to specific peer
            const callEndSent = forwardToPeer(roomId, data.targetUserId, {
                type: 'call-ended',
                fromUserId: userId
            });
            console.log(`Call end message forwarding ${callEndSent ? 'successful' : 'failed'} - from ${userId} to ${data.targetUserId}`);
            break;

        case 'participant-update':
            // Update participant status (mute, video, etc.)
            broadcastToRoom(roomId, {
                type: 'participant-update',
                userId,
                updates: data.updates
            }, ws);
            console.log(`Participant update broadcast from ${userId}`);
            break;

        case 'request-participants':
            // Send current participants list
            ws.send(JSON.stringify({
                type: 'participants-list',
                participants: getRoomParticipants(roomId)
            }));
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
        } else {
            // Notify remaining participants
            broadcastToRoom(roomId, {
                type: 'participant-left',
                userId,
                userName,
                participants: getRoomParticipants(roomId)
            });
        }
    }

    // Remove connection
    connections.delete(ws);
}

function getRoomParticipants(roomId) {
    const room = rooms.get(roomId);
    if (!room) return [];

    const participants = [];
    // Clean up any dead connections first
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
                joinedAt: connection.joinedAt
            });
        } else {
            deadConnections.push(ws);
        }
    }

    // Remove dead connections
    deadConnections.forEach(deadWs => {
        room.delete(deadWs);
        connections.delete(deadWs);
    });

    return participants;
}

function broadcastToRoom(roomId, message, excludeWs = null) {
    const room = rooms.get(roomId);
    if (!room) {
        console.log(`Room ${roomId} not found for broadcast`);
        return;
    }

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const ws of room) {
        if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(messageStr);
                sentCount++;
            } catch (error) {
                console.error('Error broadcasting to WebSocket:', error);
            }
        }
    }

    console.log(`Broadcast sent to ${sentCount} participants in room ${roomId}`);
}

function forwardToPeer(roomId, targetUserId, message) {
    const room = rooms.get(roomId);
    if (!room) {
        console.log(`Room ${roomId} not found for peer forwarding`);
        return false;
    }

    const messageStr = JSON.stringify(message);
    for (const ws of room) {
        const connection = connections.get(ws);
        if (connection && connection.userId === targetUserId && ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(messageStr);
                return true;
            } catch (error) {
                console.error('Error forwarding to peer:', error);
                return false;
            }
        }
    }

    console.log(`Target peer ${targetUserId} not found in room ${roomId}`);
    return false;
}

// Health check endpoint
server.on('request', (req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            status: 'ok',
            rooms: rooms.size,
            connections: connections.size,
            roomDetails: Array.from(rooms.entries()).map(([roomId, participants]) => ({
                roomId,
                participantCount: participants.size,
                participants: getRoomParticipants(roomId)
            })),
            timestamp: new Date().toISOString()
        }));
    } else if (req.url === '/rooms') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        const roomsInfo = Array.from(rooms.entries()).map(([roomId, participants]) => ({
            roomId,
            participantCount: participants.size,
            participants: getRoomParticipants(roomId)
        }));
        res.end(JSON.stringify({ rooms: roomsInfo }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`WebRTC Signaling Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Rooms info: http://localhost:${PORT}/rooms`);
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

// Clean up dead connections periodically
setInterval(() => {
    const deadConnections = [];

    for (const [ws, connection] of connections.entries()) {
        if (ws.readyState !== WebSocket.OPEN) {
            deadConnections.push(ws);
        }
    }

    deadConnections.forEach(ws => {
        handleDisconnection(ws);
    });

    if (deadConnections.length > 0) {
        console.log(`Cleaned up ${deadConnections.length} dead connections`);
    }
}, 60000); // Clean up every minute