const mongoose = require('mongoose');
const PrivateChat = require('../models/PrivateChat');
const GroupChat = require('../models/GroupChat');
const User = require('../models/User');
const connections = {}; // Store WebSocket connections by pair of usernames

// Add contact when a new message is received
async function addContact(sender, receiver, type,) {
  try {
    // Find the recipient user by their userId
    const user = await User.findOne({ username: sender });
    console.log(user)
    console.log(receiver)
    console.log(type)

    
    if (!user) {
      throw new Error('User not found');
    }

    const receiverData = await User.findOne({ username: receiver });
    
    if (!receiverData) {
      throw new Error('receiver not found');
    }

    // Check the message type and add to the corresponding contacts list
    if (type === 'private') {
      // Check if the sender is already a private contact
      const contactExists = receiverData.contacts.private.some(contact => contact.username === sender);
      if (!contactExists) {
        // Add the sender as a private contact
        receiverData.contacts.private.push({
          username: sender,
          firstname: user.firstname,
          lastname: user.lastname,
        });
      }
    }

    // Save the updated user document
    await receiverData.save();
    console.log('Contact added successfully');
    
  } catch (error) {
    console.error('Error adding contact:', error.message);
  }
}

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
 
  const messageToSent = {
    type: 'private',
    receiver: receiverUsername,
    sender: senderUsername,
    messages: [{
      sender: senderUsername,
      content: message,
      timestamp: new Date(),
    }],
  };

  try {
    // Store the message in the database
    await storePrivateMessage(senderUsername, receiverUsername, message);

    // Check if the arecipient is online
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

const storeGroupMessage = async (sender, groupName, content) => {
  try {
    // Find the group chat by group name
    const groupChat = await GroupChat.findOne({ name: groupName });

    if (!groupChat) {
      // If the group doesn't exist, return an error
      console.error(`Group "${groupName}" not found.`);
      return;
    }

    // Add the new message to the group's message array
    groupChat.messages.push({
      sender,
      receiver: groupName,  // Group name as the receiver
      content: content,
      timestamp: new Date(),
    });

    // Save the updated group chat document
    await groupChat.save();
    console.log(`Group message stored for group: ${groupName}`);
  } catch (error) {
    console.error(`Failed to store message in group ${groupName}:`, error);
  }
};


const sendGroupMessageToParticipants = async (sender, groupName, content) => {
  try {
    const messageToSend = {
      type: 'group',
      sender,
      receiver: groupName,  // Group name as receiver
      messages: [{
        sender,
        receiver: groupName,  // Group name as receiver
        content,
        timestamp: new Date(),
      }],
    };

    // Fetch the group chat document
    const groupChat = await GroupChat.findOne({ name: groupName });
    if (!groupChat) {
      console.log(`Group "${groupName}" not found.`);
      return;
    }

    // Send the message to all participants in the group who are online
    groupChat.participants.forEach((participant) => {
      const client = connections[participant]; // Assuming `connections` holds online users
      if (client && client.ws) {
        client.ws.send(JSON.stringify(messageToSend));
        console.log(`Message sent to ${participant} in group ${groupName}`);
      } else {
        console.log(`${participant} is offline. Message not delivered.`);
      }
    });
  } catch (error) {
    console.error(`Error sending group message to participants:`, error);
  }
};

const sendAllGroupMessages = async (ws, senderUsername, groupName) => {
  try {
    // Fetch all messages for the group from the database
    const groupChat = await GroupChat.findOne({ name: groupName });
    if (!groupChat) {
      ws.send(JSON.stringify({ error: "Group not found" }));
      return;
    }

    // Format the messages to send them back
    const formattedMessages = {
      type: 'group',
      sender: senderUsername,
      receiver: groupName,  // Group name as receiver
      messages: groupChat.messages,
    };

    // Send the group messages to the client
    ws.send(JSON.stringify(formattedMessages));
    console.log(`Sent all messages for group: ${groupName}`);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    ws.send(JSON.stringify({ error: "Failed to fetch group messages" }));
  }
};


// Handle WebSocket connection
const handleConnection = async (ws, senderUsername, receiverUsername) => {
  // Store the connection in the 'connections' object
  connections[senderUsername] = { ws };

  // Send all existing messages between the two users
  await sendAllMessages(ws, senderUsername, receiverUsername);
  await sendAllGroupMessages(ws, senderUsername, receiverUsername);
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

  await addContact(sender, receiver, type,)

  // Handle private message
  if (type === 'private') {
    await sendMessageToUser(sender, receiver, content);
  }

  // Handle group messages
  if (type === 'group') {
    // Store the group message
    await storeGroupMessage(sender, receiver, content);

    // Send the message to all participants of the group
    await sendGroupMessageToParticipants(sender, receiver, content);
  }
};

module.exports = {
  handleConnection,
  handleDisconnection,
  handleMessage,
};
