/**
 * Created by Information on 2016/1/29.
 */

var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

module.exports.locationsListByDistance = function (req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};

module.exports.locationsCreate = function (req, res) {
  // Calling new function from each controller function
  sendJsonResponse(res, 200, {"status" : "success"});
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