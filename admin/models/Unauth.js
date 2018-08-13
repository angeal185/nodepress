const mongoose = require('mongoose'),
unauthSchema = require('../schemas/unauth');

module.exports = mongoose.model('Unauth',unauthSchema);
