const mongoose = require('mongoose');
const PrivateChat = require('../models/PrivateChat');
const GroupChat = require('../models/GroupChat');
const connections = {}; // Store WebSocket connections by pair of usernames

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
    content: message,
    sender: senderUsername,
    timestamp: new Date(),
  }

  const messageToSent = {
    type: 'private',
    receiver: receiverUsername,
    sender: senderUsername,
    messages: [formattedMessage],
  };

  try {
    // Store the message in the database
    await storePrivateMessage(senderUsername, receiverUsername, message);

    // Check if the recipient is online
    const client = connections[receiverUsername];
    if (client && client.ws) {
      // Send message if the recipient is online
      client.ws.send(JSON.stringify(messageToSent));
      console.log(`Message sent to ${receiverUsername}`);
    } else {
      console.log(`User ${receiverUsername} is offline. Message not delivered.`);
    }
  } catch (error) {
    console.error(`Failed to send message to ${receiverUsername}:`, error);
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
  // Store the connection in the 'connections' object
  connections[senderUsername] = { ws };

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
