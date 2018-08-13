const mongoose = require('mongoose'),
pagesSchema = require('../schemas/pages');

module.exports = mongoose.model('pages',pagesSchema);
