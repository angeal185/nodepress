const mongoose = require('mongoose'),
usersSchema = require('../schemas/users');

module.exports = mongoose.model('User',usersSchema);
