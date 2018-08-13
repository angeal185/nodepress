const mongoose = require('mongoose');

//unauth user
module.exports = new mongoose.Schema({
    userName: String,
    city: String,
    country: String,
    time: {
        type: Date,
        default: ''
    },
    ip: {
        type: String,
        default: ''
    },
    baseToken: {
        type: String,
        default: ''
    }
});
