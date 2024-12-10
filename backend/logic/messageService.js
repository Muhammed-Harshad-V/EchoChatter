const mongoose = require('mongoose');
const PrivateChat = require('../models/PrivateChat');
const MessageQueue = require('../models/MessageQueue');
const GroupChat = require('../models/GroupChat');
const GroupMessageQueue = require('../models/GroupMessageQueue');
const connections = {}; // Store WebSocket connections by pair of usernames

// Function to add messages to MongoDB queue for offline users (private messages)
const addMessageToQueue = async (username, message) => {
  let queue = await MessageQueue.findOne({ username });
  if (!queue) {
    queue = new MessageQueue({ username, messages: [] });
  }
  queue.messages.push(message);
  await queue.save();
};

// Function to store a private message in the database
const storePrivateMessage = async (sender, receiver, message) => {
  console.log(sender, receiver, message)
  let privateChat = await PrivateChat.findOne({
    participant: { $all: [sender, receiver] }
  });

  if (!privateChat) {
    privateChat = new PrivateChat({
      participant: [sender, receiver],
      messages: [{
        sender,
        content: message,
        timestamp: new Date(),
      }]
    });
    await privateChat.save();
  } else {
    privateChat.messages.push({
      sender,
      content: message,
      timestamp: new Date(),
    });
    await privateChat.save();
  }
};

// Function to send a private message to a user (online or offline)
const sendMessageToUser = async (senderUsername, receiverUsername, message) => {
  const formattedMessage = {
    type: 'private',
    receiver: receiverUsername,
    sender: senderUsername,
    message,
    timestamp: new Date(),
  };

  const connectionKey = `${senderUsername}-${receiverUsername}`;
  const reverseConnectionKey = `${receiverUsername}-${senderUsername}`;

  // Store the message in the database
  await storePrivateMessage(senderUsername, receiverUsername, message);

  // Check if the receiver is online
  if (connections[connectionKey] || connections[reverseConnectionKey]) {
    // Send message if user is online
    const client = connections[connectionKey] || connections[reverseConnectionKey];
    client.ws.send(JSON.stringify(formattedMessage));
  } else {
    // Otherwise, queue the message for the user
    await addMessageToQueue(receiverUsername, formattedMessage);
  }
};

// Function to send all stored private and group messages for a user
const sendAllMessages = async (ws, senderUsername, receiverUsername) => {
  try {
    // Fetch private chat messages between the two users
    const privateChats = await PrivateChat.find({
      participant: { $all: [senderUsername, receiverUsername] }
    });

    const formattedMessages = privateChats.map(chat => ({
      type: 'private',
      receiver: receiverUsername,
      sender: senderUsername,
      messages: chat.messages,
    }));

    // Send the messages to the client
    ws.send(JSON.stringify(formattedMessages));
  } catch (error) {
    console.error("Error fetching messages:", error);
    ws.send(JSON.stringify({ error: "Failed to fetch messages" }));
  }
};

// Handle WebSocket connection
const handleConnection = async (ws, senderUsername, receiverUsername) => {
  // Use a unique key to identify the connection between sender and receiver
  const connectionKey = `${senderUsername}-${receiverUsername}`;
  const reverseConnectionKey = `${receiverUsername}-${senderUsername}`;

  // Store the connection in the 'connections' object
  connections[connectionKey] = { ws };

  // Send all existing messages between the two users
  await sendAllMessages(ws, senderUsername, receiverUsername);
};

// Handle WebSocket disconnection (remove user)
const handleDisconnection = async (ws) => {
  // Remove the connection when the user disconnects
  for (let key in connections) {
    if (connections[key].ws === ws) {
      delete connections[key]; // Remove from in-memory store
      break;
    }
  }
};

// Handle incoming messages from clients
const handleMessage = async (ws, message) => {
  const { type, sender, receiver, content } = message;

  // Handle private message
  if (type === 'private') {
    await sendMessageToUser(sender, receiver, content);
  }

  // Handle group message (optional - add if needed)
  if (type === 'group') {
    // Add your group chat message logic here (not required in this case)
  }
};

module.exports = {
  handleConnection,
  handleDisconnection,
  handleMessage,
};
