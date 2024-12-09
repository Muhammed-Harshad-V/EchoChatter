const mongoose = require('mongoose');
const PrivateChat = require('../models/PrivateChat');
const MessageQueue = require('../models/MessageQueue');
const GroupChat = require('../models/GroupChat');
const GroupMessageQueue = require('../models/GroupMessageQueue');
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

  const receiverClient = clients[receiverUsername];

  // Store the message in the database
  await storePrivateMessage(senderUsername, receiverUsername, message);

  if (receiverClient) {
    // Send message if user is online
    console.log(` formatted messege : ${formattedMessage}`)
    receiverClient.ws.send(JSON.stringify(formattedMessage));
  } else {
    // Otherwise, queue the message for the user
    await addMessageToQueue(receiverUsername, formattedMessage);
  }
};

// Function to create or update a group chat message
const sendMessageToGroup = async (groupName, sender, receiver, message) => {
  let groupChat = await GroupChat.findOne({ name: groupName });

  const formattedMessage = {
    type: 'group',
    groupName: groupName,
    sender: sender,
    message: message,
    timestamp: new Date(),
  };

  if (!groupChat) {
    groupChat = new GroupChat({
      name: groupName,
      participants: [sender, receiver], // Start with sender
      messages: [formattedMessage],
    });
    await groupChat.save();
  } else {
    groupChat.messages.push(formattedMessage);
    await groupChat.save();
  }

  // Broadcast the message to all users in the group
  groupChat.participants.forEach(participant => {
    const client = clients[participant];
    if (client) {
      client.ws.send(JSON.stringify(formattedMessage));
    } else {
      // Queue the group message for offline users
      addMessageToGroupQueue(participant, groupName, `${sender}: ${message}`);
    }
  });
};

// Function to send all stored private and group messages for a user
const sendAllMessages = async (ws, username) => {
  // Send all private chat messages for the user
  const privateChats = await PrivateChat.find({ participant: username });
  const privateMessages = privateChats.map(chat => {
    return chat.messages.map(msg => ({
      type: 'private',
      receiver: chat.participant.find(p => p !== username), // The other participant
      sender: msg.sender,
      message: msg.content,
      timestamp: msg.timestamp,
    }));
  }).flat(); // Flatten the array of messages

  // Send all group chat messages for the user
  const groupChats = await GroupChat.find({ participants: username });
  const groupMessages = groupChats.map(chat => {
    return chat.messages.map(msg => ({
      type: 'group',
      groupName: chat.name,
      sender: msg.sender,
      message: msg.message,
      timestamp: msg.timestamp,
    }));
  }).flat(); // Flatten the array of messages

  // Combine private and group messages and send them all at once
  const allMessages = [...privateMessages, ...groupMessages];
  
  // Send all messages to the frontend
  ws.send(JSON.stringify({
    action: 'allMessages',
    messages: allMessages,
  }));

  // Send queued private messages for this user
  let queue = await MessageQueue.findOne({ username });
  if (queue) {
    queue.messages.forEach(msg => ws.send(JSON.stringify(msg))); // Send queued messages
    await MessageQueue.deleteOne({ username }); // Clear the queue
  }

  // Send queued group messages
  let groupQueue = await GroupMessageQueue.findOne({ username });
  if (groupQueue) {
    groupQueue.messages.forEach(msg => ws.send(msg)); // Send queued messages
    await GroupMessageQueue.deleteOne({ username }); // Clear the queue
  }
};

// Handle WebSocket connection
const handleConnection = async (ws, username) => {
  clients[username] = { ws };

  // Send all messages when the user connects
  await sendAllMessages(ws, username);
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
  console.log(content)

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
