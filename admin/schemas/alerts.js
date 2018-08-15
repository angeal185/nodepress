const mongoose = require('mongoose');

//sessions
module.exports = new mongoose.Schema({
    userName: String,
    country: String,
    city: String,
    time: Date,
    ip: String
});
