const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    title: String,
    content: {
        type: String,
        default: ''
    },
    CSS: {
      type: Array,
      default: []
    },
    JS: {
      type: Array,
      default: []
    },
    addTime: {
        type: Date,
        default: ''
    }
});
