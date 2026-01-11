let rooms = {}; // Example structure: { roomId: { users: [], messages: [] } };

function initializeSockets(io) {
    io.on('connection', (socket) => {
        let currentRoom = null;

        // --- CHAT FUNCTIONALITY ---

        // When a user joins a room
        socket.on('joinRoom', ({ username, roomId }) => {
            currentRoom = roomId;

            // Initialize room if it doesn't exist
            if (!rooms[currentRoom]) {
                rooms[currentRoom] = { users: [], messages: [] };
            }

            // Add the user to the room's user list
            if (!rooms[currentRoom].users.includes(username)) {
                rooms[currentRoom].users.push(username);
            }

            // Send previous messages to the user
            socket.emit('messageHistory', rooms[currentRoom].messages);

            // Log the join event on the server
            console.log(`${username} joined room ${roomId}`);

            // Join the room
            socket.join(currentRoom);
        });

        // When a user sends a message
        socket.on('sendMessage', ({ username, message, roomId }) => {
            const messageData = { username, message };

            // Store the message in the room's history
            if (rooms[roomId]) {
                rooms[roomId].messages.push(messageData);
            }

            // Broadcast the message to all users in the room
            io.to(roomId).emit('message', messageData);
        });

        // When a user disconnects
        socket.on('disconnect', () => {
            if (currentRoom) {
                console.log(`A user disconnected from room ${currentRoom}`);
            }
        });

        // --- WEBRTC SIGNALING FOR VOICE CALLS ---

        // Handle WebRTC offer
        socket.on('offer', ({ offer, roomId }) => {
            console.log(`Received offer for room ${roomId}`);
            socket.to(roomId).emit('offer', { offer });
        });

        // Handle WebRTC answer
        socket.on('answer', ({ answer, roomId }) => {
            console.log(`Received answer for room ${roomId}`);
            socket.to(roomId).emit('answer', { answer });
        });

        // Handle ICE candidate
        socket.on('iceCandidate', ({ candidate, roomId }) => {
            console.log(`Received ICE candidate for room ${roomId}`);
            socket.to(roomId).emit('iceCandidate', { candidate });
        });

        // Handle joining a room for signaling
        socket.on('joinVoiceCall', ({ username, roomId }) => {
            console.log(`${username} joined voice call in room ${roomId}`);
            socket.join(roomId);
        });
    });
}

module.exports = { initializeSockets };
