const mongoose = require('mongoose');

//gallery
module.exports = new mongoose.Schema({
  title: String,
    subscribers: {
        type: Array,
        default: []
    }
});
