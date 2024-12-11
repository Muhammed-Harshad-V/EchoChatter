const mongoose = require('mongoose');

// Group Chat Schema
const groupChatSchema = new mongoose.Schema({
  name: {               // Group name (e.g., "Tech Enthusiasts")
    type: String,
    required: true,
    unique: true,
  },
  participants: [{      // List of Usernames (as strings)
    type: String,
    required: true
  }],
  messages: [{          // List of messages in the group chat
    sender: { 
      type: String,  // Sender's username (string)
    },
     receiver: { 
      type: String,  // Sender's username (string)
    },
    content: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
}, { timestamps: true });

// Create Group Chat Model
const GroupChat = mongoose.model('GroupChat', groupChatSchema);

module.exports = GroupChat;
