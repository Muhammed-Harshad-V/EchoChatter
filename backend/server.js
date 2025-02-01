const express = require('express');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const UserRoutes = require('./routes/UserRoute');  // Importing the User Routes
const { handleMessage, handleDisconnection, handleConnection,} = require('./logic/messageService');



// MongoDB Connection
const DB_URI = 'mongodb+srv://admin:admin7736pass@roombooking.ysmxa.mongodb.net/echochatter?retryWrites=true&w=majority&appName=RoomBooking';
mongoose.connect(DB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Initialize Express and WebSocket Server
const app = express();

app.use(cors({
    origin: 'https://echochatter.onrender.com',  // Allow only this frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));

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
    const pathSegments = request.url.split('/');  // Split the URL by '/'

    // Extract receiver and sender from the URL
    const receiver = pathSegments[2];   // This is the sender (self)Receiver is the 4th segment in the URL
    const sender = pathSegments[1];  // This is the receiver (username)
    console.log(`reciever ${receiver}`)
    console.log(`senter ${sender}`)


    // Upgrade the connection to WebSocket and pass username along
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, receiver , sender); // Emit the connection event with ws and username
    });
});

// WebSocket Connection Handling
wss.on('connection', async (ws, receiver, sender) => {

    await handleConnection(ws, sender, receiver);

    // Listen for incoming messages
    ws.on('message', async (data) => {
                // Check if data is a Buffer
            if (Buffer.isBuffer(data)) {
                data = data.toString();  // Convert buffer to string
            }


        try {
             // If the data is a string, parse it into a JSON object
        let parsedMessage;
        if (typeof data === 'string') {
            parsedMessage = JSON.parse(data);
        } else {
            // If it's already an object, use it directly
            parsedMessage = data;
        }

            const { type, sender, receiver, name, content } = parsedMessage;  // Expecting { type, sender, receiver, group, content }

            if (type === 'private') {
                await handleMessage(ws, parsedMessage);  // Private message
            } else if (type === 'group') {
                await handleMessage(ws, parsedMessage);  // Group message
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({ error: 'Invalid message format or missing data!' }));
            handleDisconnection(ws);
        }
    });

    // Handle disconnection
    ws.on('close', (event) => {
        handleDisconnection(ws);  // Clean up on disconnect
    });
});

