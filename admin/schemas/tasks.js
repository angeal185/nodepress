const mongoose = require('mongoose');

//sessions
module.exports = new mongoose.Schema({
    task: String,
    description: String,
    city: String,
    start: String,
    finish: String,
    status: String
});
