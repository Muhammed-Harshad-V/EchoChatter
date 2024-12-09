const string = require('mongoose');

const privateChatSchema = new string.Schema({
    participants: [{ type: String, required: true }], // Array of User IDs
    messages: [
        {
            sender: { type: String, required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        }
    ],
}, { timestamps: true });

const PrivateChat = string.model('PrivateChat', privateChatSchema);

module.exports = PrivateChat;