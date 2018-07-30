const mongoose = require('mongoose');

//user
module.exports = new mongoose.Schema({
    userName: String,
    firstName: String,
    lastName: String,
    password: String,
    userEmail: String,
    isAdmin: {
        type: String,
        default: 'author'
    },
    city: String,
    country: String,
    addTime: {
        type: Date,
        default: ''
    },
    userImg: String,
    facebook: {
        type: String,
        default: ''
    },
    twitter: {
        type: String,
        default: ''
    },
    linkedin: {
        type: String,
        default: ''
    },
    ip: {
        type: String,
        default: ''
    },
    token: {
        type: String,
        default: ''
    },
    friends: {
        type: Array,
        default: []
    },
    friendRequests: {
        type: Array,
        default: []
    },
    friendRequesting: {
        type: Array,
        default: []
    }
});
