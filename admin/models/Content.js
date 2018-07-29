const mongoose = require('mongoose'),
contentsSchema = require('../schemas/contents');

module.exports = mongoose.model('contents',contentsSchema);
