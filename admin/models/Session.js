const mongoose = require('mongoose'),
sessionSchema = require('../schemas/sessions');

module.exports = mongoose.model('sessions',sessionSchema);
