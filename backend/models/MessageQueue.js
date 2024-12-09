const mongoose = require('mongoose');

const messageQueueSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    messages: [{ type: Object }], // Array of queued messages
});

const MessageQueue = mongoose.model('MessageQueue', messageQueueSchema);
module.exports = MessageQueue;