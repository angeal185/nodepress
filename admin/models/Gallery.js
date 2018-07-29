const mongoose = require('mongoose'),
gallerySchema = require('../schemas/gallery');

module.exports = mongoose.model('Gallery',gallerySchema);
