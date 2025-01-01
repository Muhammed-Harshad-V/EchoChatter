const mongoose = require('mongoose');
const PrivateChat = require('../models/PrivateChat');
const GroupChat = require('../models/GroupChat');
const User = require('../models/User');
const connections = {}; // Store WebSocket connections by pair of usernames
       console.log(connections)
// Function to get a connection by username
function getConnection(username) {
  return connections[username];
}

async function handleConnection(ws, senderUsername, receiverUsername) {
  // Check if the sender is already connected
  if (connections[senderUsername]) {
    console.log(`${senderUsername} is already connected. Closing the new connection.`);

    // Close the existing WebSocket connection before adding the new one
    const existingWs = connections[senderUsername].ws;
    if (existingWs.readyState === WebSocket.OPEN) {
      existingWs.close(); // Close the old connection
      console.log(`Closed existing connection for ${senderUsername}`);
    }

    // Now remove the old connection
    delete connections[senderUsername];
  }

  // Add the new connection for the sender
  connections[senderUsername] = { ws };

  console.log(`${senderUsername} connected via WebSocket`);
    console.log(connections)
  // Send all messages between the sender and receiver (if necessary)
  try {
    await sendAllMessages(ws, senderUsername, receiverUsername);
    await sendAllGroupMessages(ws, senderUsername, receiverUsername);
  } catch (error) {
    console.error("Error while sending messages:", error);
  }}

async function addContact(sender, receiver, type, connections) {
  console.log(sender, receiver, type, connections);
  try {
    // Find the sender user by their username
    const senderData = await User.findOne({ username: sender });
    if (!senderData) {
      return;
    }

    // Find the receiver user by their username
    const receiverData = await User.findOne({ username: receiver });
    if (!receiverData) {
      return;
    }

    // Flag to determine if a new contact was added
    let isNewContactAdded = false;

    // Add the contact to both sender and receiver
    if (type === 'private') {
      // Add the sender as a private contact for the receiver if not already added
      const contactExists = receiverData.contacts.private.some(contact => contact.username === sender);
      if (!contactExists) {
        receiverData.contacts.private.push({
          username: sender,
          firstname: senderData.firstname,
          lastname: senderData.lastname,
        });
        isNewContactAdded = true; // Mark that a new contact was added
      }

      // Add the receiver as a private contact for the sender if not already added
      const senderContactExists = senderData.contacts.private.some(contact => contact.username === receiver);
      if (!senderContactExists) {
        senderData.contacts.private.push({
          username: receiver,
          firstname: receiverData.firstname,
          lastname: receiverData.lastname,
        });
        isNewContactAdded = true; // Mark that a new contact was added
      }
    }

    // If no new contact was added, skip saving and sending notifications
    if (!isNewContactAdded) {
      return; // No contact was added, so no need to continue
    }

    // Save the updated sender and receiver user documents
    await senderData.save();
    await receiverData.save();

    // Prepare notification message
    const messageToSend = { type: 'contact-update', message: 'New contact added!' };

    // Check if the recipient (receiver) is online and send the notification if so
    const receiverClient = connections[receiver];
    if (receiverClient && receiverClient.ws && receiverClient.ws.readyState === WebSocket.OPEN) {
      receiverClient.ws.send(JSON.stringify(messageToSend)); // Send WebSocket notification to receiver
    }

    // Check if the sender is online and send the notification if so
    const senderClient = connections[sender];
    if (senderClient && senderClient.ws && senderClient.ws.readyState === WebSocket.OPEN) {
      senderClient.ws.send(JSON.stringify(messageToSend)); // Send WebSocket notification to sender
    }

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
// const handleConnection = async (ws, senderUsername, receiverUsername) => {
//   // Store the connection in the 'connections' object
//   connections[senderUsername] = { ws };

//   // Send all existing messages between the two users
//   await sendAllMessages(ws, senderUsername, receiverUsername);
//   await sendAllGroupMessages(ws, senderUsername, receiverUsername);
// };

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

  await addContact(sender, receiver, type, connections)

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
  getConnection,
};
