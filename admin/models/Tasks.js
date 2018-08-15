const mongoose = require('mongoose'),
tasksSchema = require('../schemas/tasks');

module.exports = mongoose.model('Tasks',tasksSchema);
