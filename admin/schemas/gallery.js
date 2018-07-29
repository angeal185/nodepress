const mongoose = require('mongoose');

//gallery
module.exports = new mongoose.Schema({
    title: String,
    sub: String,
    url: String,
    addTime: {
        type: Date,
        default: ''
    }
});
