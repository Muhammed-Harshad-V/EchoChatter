const express = require('express');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const UserRoutes = require('./routes/UserRoute');  // Importing the User Routes
const { handleMessage, handleDisconnection, handleConnection } = require('./logic/messageService');


// MongoDB Connection
const DB_URI = 'mongodb://localhost:27017/messenger';
mongoose.connect(DB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Initialize Express and WebSocket Server
const app = express();
app.use(express.json());
const PORT = 3000;
const wss = new WebSocket.Server({ noServer: true });

app.use("/api", UserRoutes);

// Express Server
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Handle WebSocket Upgrade
server.on('upgrade', (request, socket, head) => {
    // Extract username from URL (e.g., /username)
    const username = request.url.split('/')[1];  // Example: /username (username is the first segment)

    // If no username, reject the connection
    if (!username) {
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        socket.destroy();
        return;
    }

    // Upgrade the connection to WebSocket and pass username along
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, username); // Emit the connection event with ws and username
    });
});

// WebSocket Connection Handling
wss.on('connection', async (ws, username) => {
    console.log(`${username} connected via WebSocket`);

    // Handle the new WebSocket connection
    await handleConnection(ws, username);

    // Listen for incoming messages
    ws.on('message', async (data) => {
                // Check if data is a Buffer
            if (Buffer.isBuffer(data)) {
                data = data.toString();  // Convert buffer to string
            }

            console.log('This is the raw data:', data);
            console.log(typeof(data))

        try {
             // If the data is a string, parse it into a JSON object
        let parsedMessage;
        if (typeof data === 'string') {
            parsedMessage = JSON.parse(data);
        } else {
            // If it's already an object, use it directly
            parsedMessage = data;
        }

        console.log('Parsed message:', parsedMessage);
            const { type, sender, receiver, name, content } = parsedMessage;  // Expecting { type, sender, receiver, group, content }

            if (type === 'private') {
                await handleMessage(ws, parsedMessage);  // Private message
            } else if (type === 'group') {
                await handleMessage(ws, parsedMessage);  // Group message
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({ error: 'Invalid message format or missing data!' }));
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log(`${username} disconnected`);
        handleDisconnection(ws);  // Clean up on disconnect
    });
});

