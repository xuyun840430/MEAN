/**
 * Created by Information on 2016/1/29.
 */

var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

/**
 * Create review by first post request.
 * @param req
 * @param res
 */
module.exports.reviewsCreate = function (req, res) {
  var locationid = req.params.locationid;
  if (locationid) {
    Loc
      .findOne({_id : req.params.locationid})
      .select('reviews')
      .exec(
        function (err, location) {
          if (err) {
            sendJsonResponse(res, 400, err);
          } else {
            // Successful find operation will call new function to add review,
            // passing request, response, and location objects
            doAddReview(req, res, location);
          }
        }
      );
  } else {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid required"
    });
  }
};

// When provided with a parent document
var doAddReview = function (req, res, location) {
  if (!location) {
    sendJsonResponse(res, 404, {
      "message": "locationid not found"
    });
  } else {
    // Push new data into subdocument array
    location.reviews.push({ // data is sent by request() from 'postdata' in "app_server/controllers/locations"
      author: req.body.author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });

    // Before saving it
    location.save(function (err, location) {
      var thisReview;
      if (err) {
        // Mongoose validation errors are returned through error object following attempted save action
        console.log(err);
        sendJsonResponse(res, 400, err);
      } else {
        // On successful save operation call function  to update average rating
        updateAverageRating(location._id);
        // Retrieve last review added to array and return it as JSON confirmation response
        thisReview = location.reviews[location.reviews.length - 1];
        sendJsonResponse(res, 201, thisReview);
      }
    });
  }
};

var updateAverageRating = function (locationid) {
  // Find correct document given supplied ID
  Loc
    .findOne({_id : locationid})
    .select('rating reviews')
    .exec(
      function (err, location) {
        if (err) {
          doSetAverageRating(location);
        }
    });
};

var doSetAverageRating = function (location) {
  var i, reviewCount, ratingAverage, ratingTotal;
  if (location.reviews && location.reviews.length > 0) {
    reviewCount = location.reviews.length;
    ratingTotal = 0;

    // Loop through review subdocuments adding up ratings
    for (i = 0; i < reviewCount; i++) {
      ratingTotal = ratingTotal + location.reviews[i].rating;
    }

    // Calculate average rating value
    ratingAverage = parseInt(ratingTotal / reviewCount, 10);
    // Update rating value of parent document
    location.rating = ratingAverage;
    // Save parent document
    location.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Average rating updated to", ratingAverage);
      }
    });
  }
};

module.exports.reviewsReadOne = function (req, res) {
  // Verify that reviewid exists as a parameter
  if (req.params && req.params.locationid && req.params.reviewid) {
    Loc
      .findOne({_id : req.params.locationid})
      .select('name reviews') // Get name of location and its reviews from mongoose model query
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

        // Check that returned location has reviews
        if (location.reviews && location.reviews.length > 0) {
          // Use Mongoose subdocument .id method as a helper for searching for "_id" field in DB
          review = location.reviews.id(req.params.reviewid);
          if (!review) {
            sendJsonResponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            // If review is found build response object returning review and location name and ID
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
          // If no reviews are found return an appropriate error message
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

/**
 * Update subdocument review
 * @param req
 * @param res
 */
module.exports.reviewsUpdateOne = function (req, res) {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }
  Loc
    .findOne({_id : req.params.locationid}) // Find parent document
    .select('reviews')
    .exec(
      function (err, location) {
        var thisReview;
        if (!location) {
          sendJsonResponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
        }

        // Find subdocument
        if (location.reviews && location.reviews.length > 0) {
          thisReview = location.reviews.id(req.params.reviewid);
          if (!thisReview) {
            sendJsonResponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            // Make changes to subdocument from supplied form data
            thisReview.author = req.body.author;
            thisReview.rating = req.body.rating;
            thisReview.reviewText = req.body.reviewText;

            // Save parent document
            location.save(function (err, location) {
              // Return a JSON response, sending subdocument object on basis of successful save
              if (err) {
                sendJsonResponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJsonResponse(res, 200, thisReview);
              }
            });
          }
        } else {
          sendJsonResponse(res, 404, {
            "message": "No review to update"
          });
        }
      }
    );
};

/**
 * Delete subdocument review from mongoDB
 * @param req
 * @param res
 */
module.exports.reviewsDeleteOne = function (req, res) {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJsonResponse(res, 404, {
      "message": "Not found, locationid and reviewid are both required"
    });
    return;
  }

  // Find relevant parent document
  Loc
    .findOne({_id : req.params.locationid})
    .select('reviews')
    .exec(
      function(err, location) {
        if (!location) {
          sendJsonResponse(res, 404, {
            "message": "locationid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
          return;
        }
        if (location.reviews && location.reviews.length > 0) {
          if (!location.reviews.id(req.params.reviewid)) {
            sendJsonResponse(res, 404, {
              "message": "reviewid not found"
            });
          } else {
            // Find and delete relevant subdocument in one step
            location.reviews.id(req.params.reviewid).remove();
            // Save parent document
            location.save(function(err) {
              // Return appropriate success or failure response
              if (err) {
                sendJsonResponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJsonResponse(res, 204, null);
              }
            });
          }
        } else {
          sendJsonResponse(res, 404, {
            "message": "No review to delete"
          });
        }
      }
    );
};

// Utility function that accepts response object, a status code, and a data object
var sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};