const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Route to the login page
router.get('/', (req, res) => {
    if (req.session.username) {
        return res.redirect('/home');
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route to handle login form submission
router.post('/login', (req, res) => {
    const { username } = req.body;
    if (username) {
        req.session.username = username;
        return res.redirect('/home');
    }
    res.redirect('/');
});

// Route to the home page
router.get('/home', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Route to the create room page
router.get('/create_room', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'create_room.html'));
});

// Declare rooms as a global array
let rooms = [];

// Route to create a room
router.post('/create_room', (req, res) => {
    const { room_name, room_type } = req.body;

    // Check if room with the same name already exists
    if (rooms.some(room => room.name === room_name)) {
        return res.status(400).json({ message: 'Room name already exists.' });
    }

    // Create the new room
    const newRoom = {
        id: uuidv4(),
        name: room_name,
        type: room_type || 'Private',
    };

    // Add the room to the global list
    rooms.push(newRoom);

    // Add the room to the user's session
    if (!req.session.createdRooms) {
        req.session.createdRooms = [];
    }
    req.session.createdRooms.push(newRoom);

    res.status(201).json({ message: 'Room created successfully.', room: newRoom });
});

// Route to get all public rooms
router.get('/rooms/public', (req, res) => {
    const publicRooms = rooms.filter(room => room.type === 'Public');
    res.json(publicRooms);
});

// Route to get rooms created by the user
router.get('/rooms/user', (req, res) => {
    const userRooms = req.session.createdRooms || [];
    res.json(userRooms);
});

// Route to delete a room created by the user
router.delete('/rooms/delete/:roomId', (req, res) => {
    const { roomId } = req.params;
    const userRooms = req.session.createdRooms || [];
    const roomIndex = userRooms.findIndex(room => room.id == roomId);

    if (roomIndex === -1) {
        return res.status(404).json({ message: 'Room not found in user’s list.' });
    }

    // Remove the room from the session and global list
    const [deletedRoom] = userRooms.splice(roomIndex, 1);
    rooms = rooms.filter(room => room.id != deletedRoom.id);

    res.json({ message: 'Room deleted successfully.', room: deletedRoom });
});

// Route to the chat room page
router.get('/room/:roomId', (req, res) => {
    const { roomId } = req.params;

    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        return res.status(404).send('Room not found');
    }

    // Send the room page
    res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

// Route to get room details (used for frontend rendering)
router.get('/room/details/:roomId', (req, res) => {
    const { roomId } = req.params;

    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        return res.status(404).send('Room not found');
    }

    res.json({
        id: room.id,
        name: room.name,
        type: room.type,
    });
});

// Route to get the logged-in username
router.get('/get_username', (req, res) => {
    if (!req.session.username) {
        return res.status(401).json({ error: 'User not logged in' });
    }
    res.json({ username: req.session.username });
});


// Route for logging out
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy the session: ', err);
        }
        res.redirect('/');
    });
});

module.exports = router;
