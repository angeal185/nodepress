const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    title: String,
    content: {
        type: String,
        default: ''
    },
    addTime: {
        type: Date,
        default: ''
    }
});
