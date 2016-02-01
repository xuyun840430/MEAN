/**
 * Created by Information on 2016/1/29.
 */

var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

module.exports.locationsListByDistance = function (req, res) {
  // Get coordinates from query string and convert from strings to numbers
  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);
  // Create geoJson point
  var point = {
    type: "Point",
    coordinates: [lng, lat]
  };
  // Send point as first parameter in geoNear method
  Loc.geoNear(point, options, callback);
};

module.exports.locationsCreate = function (req, res) {
  // Apply create method to model
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","), // Create array of facilities by splitting a comma separated list
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)], // Parse coordinates from strings to numbers
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1,
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }]
  }, function (err, location) { // Supply callback function, containing appropriate responses for success and failure
    if (err) {
      sendJsonResponse(res, 400, err);
    } else {
      sendJsonResponse(res, 201, location);
    }
  });

};

module.exports.locationsReadOne = function (req, res) {
  // Apply findById method to Location model using Loc, for shell:  db.locations.find({_id: ObjectId("56a8ddc4596524ad3f25bb37")})
  // URL: http://localhost:3000/api/locations/56a8ddc4596524ad3f25bb37

  // Error trap 1: check that locationid exists in request parameters
  if (req.params && req.params.locationid) {
    Loc
      .findOne({_id : req.params.locationid})
      .exec(function (err, location) { // Execute query and Define callback to accept possible parameters
        if (!location) {
          // Error trap 2: if Mongoose doesn’t return a location, send 404
          // message and exit function scope using return statement
          sendJsonResponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          // Error trap 3: if Mongoose returned an error, send it as 404
          // response and exit controller using return statement
          sendJsonResponse(res, 404, err);
          return;
        }

        // If Mongoose didn’t error, continue as before and send location object in a 200 response
        sendJsonResponse(res, 200, location);
      });
  } else {
    // If request parameters didn’t include locationid, send appropriate 404 response
    sendJsonResponse(res, 404, {
      "message": "No locationid in request"
    });
  }
};

module.exports.locationsUpdateOne = function (req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};

module.exports.locationsDeleteOne = function (req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};

// Utility function that accepts response object, a status code, and a data object
var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};