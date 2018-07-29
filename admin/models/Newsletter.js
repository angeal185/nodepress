const mongoose = require('mongoose'),
newsletterSchema = require('../schemas/newsletter');

module.exports = mongoose.model('Newsletter',newsletterSchema);
