let mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    message: {
        type: String,
        default: ''
    },
    reply: {
        content: String,
        user: String,
        userImg: String,
        addTime: Date
    },
    userImg: String,
    user: String,
    email: String,
    addTime: {
        type: Date,
        default: ''
    }
});
