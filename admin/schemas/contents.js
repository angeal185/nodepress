const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    title: String,
    userImg: String,
    user: {
        type: String,
        ref: 'User'
    },
    addTime: {
        type: Date,
        default: ''
    },
    views: {
        type: Number,
        default: 0
    },
    laud: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ''
    },
    titleImg: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    comments: {
        type: Array,
        default: []
    },
    category: {
        type: String,
        default: ''
    },
    tags: {
        type: Array,
        default: []
    }
});
