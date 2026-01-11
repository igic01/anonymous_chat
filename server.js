const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./routes.js');
const { initializeSockets } = require('./socket.js'); // Custom socket initialization function

const app = express();
const server = http.createServer(app); // Create the server
const io = new Server(server); // Initialize Socket.io with the server

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/style', express.static(path.join(__dirname, 'public', 'style')));

// Configure session middleware
app.use(
    session({
        secret: '12345678',
        resave: false,
        saveUninitialized: false,
    })
);

// Use routes defined in routes.js
app.use(routes);

// Initialize Socket.io
initializeSockets(io); // Call the function to set up socket events

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
