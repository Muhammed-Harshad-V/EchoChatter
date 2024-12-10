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
const sendMessageToGroup = async (name, sender, receiver, message) => {
  let groupChat = await GroupChat.findOne({ name: name });

  const formattedMessage = {
    type: 'group',
    groupName: name,
    sender: sender,
    message: message,
    timestamp: new Date(),
  };

  if (!groupChat) {
    groupChat = new GroupChat({
      name: name,
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
      addMessageToGroupQueue(participant, name, formattedMessage);
    }
  });
};

// Function to send all stored private and group messages for a user
const sendAllMessages = async (ws, username) => {
  try {
       // Fetch all private chats for the user
       const privateChats = await PrivateChat.find({ participant: username });
       const privateChatsWithType = privateChats.map(chat => ({
         ...chat.toObject(), // Convert Mongoose document to plain object
         type: 'private',
       }));
   
       // Fetch all group chats for the user
       const groupChats = await GroupChat.find({ participants: username });
       const groupChatsWithType = groupChats.map(chat => ({
         ...chat.toObject(), // Convert Mongoose document to plain object
         type: 'group',
       }));

    // Combine all messages into a single array
    const allMessages = [...privateChatsWithType, ...groupChatsWithType];

    // Send the messages to the client
    ws.send(JSON.stringify(allMessages));
  } catch (error) {
    console.error("Error fetching messages:", error);
    ws.send(JSON.stringify({ error: "Failed to fetch messages" }));
  }

  // Send queued private messages for this user
  let queue = await MessageQueue.findOne({ username });
  if (queue) {
    queue.messages.forEach(msg => ws.send(JSON.stringify(msg))); // Send queued messages
    await MessageQueue.deleteOne({ username }); // Clear the queue
  }

  // Send queued group messages
  let groupQueue = await GroupMessageQueue.findOne({ username });
  if (groupQueue) {
    groupQueue.messages.forEach(msg => ws.send(JSON.stringify(msg))); // Send queued messages
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
  const { type, sender, receiver, name, content } = message;
  console.log(content)

  // Private message handling
  if (type === 'private') {
    await sendMessageToUser(sender, receiver, content);
  }

  // Group message handling
  if (type === 'group') {
    await sendMessageToGroup(name, sender, receiver, content);
  }
};

module.exports = {
  handleConnection,
  handleDisconnection,
  handleMessage,
};
