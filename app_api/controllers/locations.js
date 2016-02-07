/**
 * Created by Information on 2016/1/29.
 */

var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

/**
 * locationsListByDistance
 * @param req
 * @param res
 */
module.exports.locationsListByDistance = function(req, res) {
  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);
  var maxDistance = parseFloat(req.query.maxDistance);
  var point = {
    type: "Point",
    coordinates: [lng, lat]
  };
  var geoOptions = {
    spherical: true,
    maxDistance: theEarth.getRadsFromDistance(maxDistance),
    num: 10
  };
  if ((!lng && lng !== 0) || (!lat && lat !== 0) || !maxDistance) {
    console.log('locationsListByDistance missing params');
    sendJsonResponse(res, 404, {
      "message": "lng, lat and maxDistance query parameters are all required"
    });
    return;
  }
  // Get results from mongoDB appending on GeoJSON longitude and latitude coordinate pairs
  Loc.geoNear(point, geoOptions, function(err, results, stats) {
    var locations;
    console.log('Geo Results', results);
    console.log('Geo stats', stats);
    if (err) {
      console.log('geoNear error:', err);
      sendJsonResponse(res, 404, err);
    } else {
      locations = buildLocationList(req, res, results, stats);
      sendJsonResponse(res, 200, locations);
    }
  });
};

var theEarth = (function() {
  var earthRadius = 6371; // km, miles is 3959

  var getDistanceFromRads = function(rads) {
    return parseFloat(rads * earthRadius);
  };

  var getRadsFromDistance = function(distance) {
    return parseFloat(distance / earthRadius);
  };

  return {
    getDistanceFromRads: getDistanceFromRads,
    getRadsFromDistance: getRadsFromDistance
  };
})();

var buildLocationList = function(req, res, results, stats) {
  var locations = [];
  results.forEach(function(doc) {
    locations.push({
      distance: theEarth.getDistanceFromRads(doc.dis),
      name: doc.obj.name,
      address: doc.obj.address,
      rating: doc.obj.rating,
      facilities: doc.obj.facilities,
      _id: doc.obj._id // Passing '_id' back for query locations
    });
  });
  return locations;
};

/**
 * locationsCreate
 * @param req
 * @param res
 */
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

/**
 * Update location by passing put method.
 * @param req
 * @param res
 */
module.exports.locationsUpdateOne = function (req, res) {
  if (!req.params.locationid) {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid is required"
    });
    return;
  }
  Loc
    .findOne({_id : req.params.locationid}) // Find location document by supplied ID
    .select('-reviews -rating') // By adding a dash in front of a path name we’re stating that we don’t want to retrieve it from the database.
    .exec(
      function (err, location) {
        if (!location) {
          sendJsonResponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
          return;
        }

        // Update paths with values from submitted form
        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(",");
        location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
        location.openingTimes = [{
          days: req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body.closed1,
        }, {
          days: req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body.closed2,
        }];
        // Save instance
        location.save(function (err, location) {
          // Send appropriate response, depending on outcome of save operation
          if (err) {
            sendJsonResponse(res, 404, err);
          } else {
            sendJsonResponse(res, 200, location);
          }
        });
    });
};

/**
 * Delete one location in mongo DB
 * @param req
 * @param res
 */
module.exports.locationsDeleteOne = function (req, res) {
  var locationid = req.params.locationid;
  if (locationid) {
    Loc
      .findOneAndRemove({_id : locationid}) // Call findOneAndRemove() method, passing in locationid
      .exec(
        function (err, location) {
          if (err) {
            sendJsonResponse(res, 404, err);
            return;
          }
          sendJsonResponse(res, 204, null);
        }
      );
  } else {
    sendJsonResponse(res, 404, {
      "message": "No locationid"
    });
  }
};

// Utility function that accepts response object, a status code, and a data object
var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};