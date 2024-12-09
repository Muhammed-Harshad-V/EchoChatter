const mongoose = require('mongoose');
const PrivateChat = require('../models/PrivateChat');
const MessageQueue = require('../models/MessageQueue');
const GroupChat = require('../models/GroupChat');
const GroupMessageQueue = require('../models/groupMessageQueue');
const clients = {}; // Store WebSocket connections by username

// Function to add messages to MongoDB queue for offline users (private messages)
const addMessageToQueue = async (username, message) => {
  let queue = await MessageQueue.findOne({ username });
  if (!queue) {
    queue = new MessageQueue({ username, messages: [] });
  }
  queue.messages.push(message);
  await queue.save();
};

// Function to add messages to MongoDB queue for offline users (group messages)
const addMessageToGroupQueue = async (username, groupName, message) => {
  let queue = await GroupMessageQueue.findOne({ username, groupName });
  if (!queue) {
    queue = new GroupMessageQueue({ username, groupName, messages: [] });
  }
  queue.messages.push(message);
  await queue.save();
};

// Function to store a private message in the database
const storePrivateMessage = async (sender, receiver, message) => {
  let privateChat = await PrivateChat.findOne({
    participants: { $all: [sender, receiver] }
  });

  if (!privateChat) {
    privateChat = new PrivateChat({
      participants: [sender, receiver],
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
  const formattedMessage = message;

  const receiverClient = clients[receiverUsername];

  // Store the message in the database
  await storePrivateMessage(senderUsername, receiverUsername, formattedMessage);

  if (receiverClient) {
    // Send message if user is online
    receiverClient.ws.send(formattedMessage);
  } else {
    // Otherwise, queue the message for the user
    await addMessageToQueue(receiverUsername, formattedMessage);
  }
};

// Function to create or update a group chat message
const sendMessageToGroup = async (groupName, sender, reciever, message) => {
  // Find existing group chat or create a new one
  let groupChat = await GroupChat.findOne({ name: groupName });

  const formattedMessage = {
    sender: sender,
    message: message,
    timestamp: new Date(),
  };

  if (!groupChat) {
    // If no group chat exists, create a new one
    groupChat = new GroupChat({
      name: groupName,
      participants: [sender, reciever], // Start with the sender's username
      messages: [formattedMessage],
    });
    await groupChat.save();
  } else {
    // Add the message to the existing group chat
    groupChat.messages.push(formattedMessage);
    await groupChat.save();
  }

  // Broadcast the message to all users in the group
  groupChat.participants.forEach(participant => {
    const client = clients[participant];
    if (client) {
      client.ws.send(`[${groupName}] ${sender}: ${message}`);
    } else {
      // Queue the group message for offline users
      addMessageToGroupQueue(participant, groupName, `${sender}: ${message}`);
    }
  });
};

// Function to send stored private messages for a user
const sendStoredPrivateMessages = async (ws, username) => {
  const privateChats = await PrivateChat.find({ participants: username });
  privateChats.forEach(chat => {
    chat.messages.forEach(msg => {
      const formattedMessage = `${msg.sender}: ${msg.content}`;
      ws.send(formattedMessage);
    });
  });
};

// Function to send stored group messages for a user
const sendStoredGroupMessages = async (ws, username) => {
  const groupQueues = await GroupChat.find({ participants: username });
  for (let queue of groupQueues) {
    // Send queued group messages
    queue.messages.forEach(msg => {
      ws.send(`[${queue.name}] ${msg.sender}: ${msg.message}`);
    });
  }
};

// Handle WebSocket connection (join group or private chat)
const handleConnection = async (ws, username) => {
  clients[username] = { ws };

  // Send queued private messages
  let queue = await MessageQueue.findOne({ username });
  if (queue) {
    queue.messages.forEach(msg => ws.send(msg)); // Send queued messages
    await MessageQueue.deleteOne({ username }); // Clear the queue
  }
  // Send queued groupchat messages
  let groupQueue = await GroupMessageQueue.findOne({ username });
  if (groupQueue) {
    groupQueue.messages.forEach(msg => ws.send(msg)); // Send queued messages
    await GroupMessageQueue.deleteOne({ username }); // Clear the queue
  }

  // Send queued group messages for the user
  await sendStoredGroupMessages(ws, username);

  // Send stored private messages for the user
  await sendStoredPrivateMessages(ws, username);
};

// Handle WebSocket disconnection (remove user)
const handleDisconnection = async (ws) => {
  for (let username in clients) {
    if (clients[username].ws === ws) {
      delete clients[username]; // Remove from in-memory store
      break;
    }
  }
};

// Handle incoming messages from clients
const handleMessage = async (ws, message) => {
  const { type, sender, receiver, group, content } = message;

  // Private message handling
  if (type === 'private') {
    await sendMessageToUser(sender, receiver, content);
  }

  // Group message handling
  if (type === 'group') {
    await sendMessageToGroup(group, sender, receiver, content);
  }
};

module.exports = {
  handleConnection,
  handleDisconnection,
  handleMessage,
};
