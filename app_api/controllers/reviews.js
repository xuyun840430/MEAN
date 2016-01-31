/**
 * Created by Information on 2016/1/29.
 */

var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

module.exports.reviewsCreate = function (req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};

module.exports.reviewsReadOne = function (req, res) {
  // Verify that reviewid exists as a parameter
  if (req.params && req.params.locationid && req.params.reviewid) {
    Loc
      .findOne({_id : req.params.locationid})
      .select('name reviews')
      .exec(function (err, location) {
        var response, review;

        if (!location) {
          sendJsonResponse(res, 404, {
            "message": "location not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
          return;
        }

        if (location.reviews && location.reviews.length > 0) {
          review = location.reviews.id(req.params.reviewid);
          if (!review) {
            sendJsonResponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            response = {
              location: {
                name: location.name,
                id: req.params.locationid
              },
              review: review
            };
            sendJsonResponse(res, 200, response);
          }
        } else {
          sendJsonResponse(res, 404, {
            "message": "No reviews found"
          });
        }
      });
  } else {
    sendJsonResponse(res, 404,  {
      "message": "Not found, locationid and reviewid are both required"
    });
  }
};

module.exports.reviewsUpdateOne = function (req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};

module.exports.reviewsDeleteOne = function (req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};

// Utility function that accepts response object, a status code, and a data object
var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};