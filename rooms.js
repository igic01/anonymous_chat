const { v4: uuidv4 } = require('uuid');

// Declare rooms as a global array
let rooms = [];

function createRoom(req, res) {
    const { room_name, room_type } = req.body;

    // Check if room with the same name already exists
    if (rooms.some(room => room.name === room_name)) {
        return res.status(400).json({ message: 'Room name already exists.' });
    }

    // Create the new room
    const newRoom = {
        id: uuidv4(), // Generate a unique ID using uuidv4
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
}

function getPublicRooms(req, res) {
    const publicRooms = rooms.filter(room => room.type === 'Public');
    res.json(publicRooms);
}

function getUserRooms(req, res) {
    const userRooms = req.session.createdRooms || [];
    res.json(userRooms);
}

function deleteRoom(req, res) {
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
}

module.exports = { createRoom, getPublicRooms, getUserRooms, deleteRoom };
