const mongoose = require('mongoose'),
messagesSchema = require('../schemas/messages');

module.exports = mongoose.model('Message',messagesSchema);
