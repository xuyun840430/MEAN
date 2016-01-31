/**
 * Created by Information on 2016/1/27.
 */

var mongoose = require('mongoose');

/**
 * Create a subdocument by using nested schemas.
 * Note: These needs to be in the same file as the 'locationSchema' definition,
 * and, importantly, must be before the 'locationSchema' definition.
 */
// Opening time schema
var openingTimeSchema = new mongoose.Schema({
  days: {type: String, required: true},
  opening: String,
  closing: String,
  closed: {type: Boolean, required: true}
});

// Review schema
var reviewSchema = new mongoose.Schema({
  author: String,
  rating: {type: Number, "default": 0, min: 0, max: 5},
  reviewText: String,
  createdOn: {type: Date, "default": Date.now}
});

// Create a location schema with subdocument 'openingTimeSchema' and 'reviewSchema'
var locationSchema = new mongoose.Schema({
  name: {type: String, required: true},
  address: String,
  rating: {type: Number, "default": 0, min: 0, max:5},
  facilities: [String], // Declare an array of same schema type by declaring that type inside square brackets
  coords: {type: [Number], index: '2dsphere'}, // Use 2dsphere to add support for GeoJSON longitude and latitude coordinate pairs
  openingTimes: [openingTimeSchema], // Add nested schema by referencing another schema object as an array
  reviews: [reviewSchema] // Reference reviews schemas to add nested subdocuments
});

mongoose.model('Location', locationSchema);