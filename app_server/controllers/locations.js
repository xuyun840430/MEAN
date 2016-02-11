/**
 * Created by Information on 2016/1/22.
 */

/**
 * Caution: Application must be restarted completely when controller changed!
 */

var request = require('request');
// Set default server URL for local development
var apiOptions = {
  server : "http://localhost:3000"
};

/* If application running in production mode set different base URL;
 change to be live address of application */
if (process.env.NODE_ENV === 'production') {
  apiOptions.server = "https://mighty-meadow-29112.herokuapp.com";
}

/**
 * Get homepage
 * @param req
 * @param res
 */
module.exports.homelist = function (req, res) {
  var requestOptions, path;

  // Set path for API request (server is already set at top of file)
  path = '/api/locations';

  // Set request options, including URL, method, empty JSON body, and hard-coded query string parameters
  requestOptions = {
    url: apiOptions.server + path,
    method: "GET",
    json: {},
    qs: {
      lng : -0.7992599,
      lat : 51.378091,
      maxDistance: 20

      // Change query string values sent in request to get no results returned
      //lng: 1,
      //lat: 1,
      //maxDistance: 0.002
    }
  };

  // Make request, sending through request options
  request(
    requestOptions,
    function (err, response, body) { // Supplying callback to render homepage with response body, (body===response.body)
      // Assign returned body data to a new variable
      var i, data;
      data = body;

      // Only run loop to format distances if API returned a 200 status and some data
      if (response.statusCode == 200 && data.length) {
        for (i = 0; i < data.length; i++) {
          data[i].distance = _formatDistance(data[i].distance);
        }
      }

      // Loop through array, formatting distance value of location
      renderHomepage(req, res, data); // Pass response body returned by request to renderHomepage function
    }
  );
};

// Modify distance format from response data
var _formatDistance = function (distance) {
  var numDistance, unit;
  // If supplied distance is over 1 km, round to one decimal place and add km unit
  if (distance > 1) {
    numDistance = parseFloat(distance).toFixed(1);
    unit = 'km'
  } else { // Otherwise convert to meters and round to nearest meter before adding m unit
    numDistance = parseInt(distance * 1000, 10);
    unit = 'm';
  }
  return numDistance + unit;
};

// Do render homepage with response body
var renderHomepage = function (req, res, responseBody) {
  var message;

  // If response isn’t array, set message, and set responseBody to be empty array
  if (!(responseBody instanceof Array)) { // Array is build in function buildLocationList()
    message = "API lookup error";
    responseBody = [];
  } else {
    // If response is array with no length, set message
    if (!responseBody.length) {
      message = "No places found nearby"
    }
  }

  // Include all code from res.render call here (snipped down for brevity)
  res.render('locations-list', {
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Loc8r helps you find places " +
    "to work when out and about. Perhaps with coffee, cake or a pint? " +
    "Let Loc8r help you find the place you're looking for.",

    // Remove hard-coded array of locations and pass responseBody through instead
    locations: responseBody,
    // Add message to variables to send to view
    message: message
  });
};


var _showError = function (req, res, status) {
  var title, content;

  // If status passed through is 404, set title and content for page
  if (status === 404) {
    title = "404, page not found";
    content = "Oh dear. Looks like we can't find this page. Sorry.";
  } else { // Otherwise set a generic catch-all message
    title = status + ", something's gone wrong";
    content = "Something, somewhere, has gone just a little bit wrong.";
  }
  // Use status parameter to set response status
  res.status(status);
  res.render('generic-text', { // Send data to view to be compiled and sent to browser
    title: title,
    content: content
  });
};

/**
 * Get 'Location info' page, show the location details
 * @param req
 * @param res
 */
module.exports.locationInfo = function (req, res) {
  // In locationInfo controller call getLocationInfo function,
  // passing a callback function  that will call renderDetailPage function upon completion
  getLocationInfo(req, res, function (req, res, responseData) {
    renderDetailPage(req, res, responseData);
  });
};

// Function getLocationInfo accepts callback as third parameter and contains
// all code that used to be in locationInfo controller
var getLocationInfo = function (req, res, callback) {
  var requestOptions, path;
  // Get locationid parameter from URL and append it to API path
  path = "/api/locations/" + req.params.locationid;

  // Set all request options needed to call API
  requestOptions = {
    url: apiOptions.server + path,
    method: "GET",
    json: {}
  };

  // Send formatted request
  request(
    requestOptions,
    function (err, response, body) {
      // Create copy of returned data in new variable
      var data = body;
      // Check for successful response from API
      if (response.statusCode == 200) {
        // Reset coords property to be an object, setting lng and lat using values pulled from API response
        data.coords = {
          lng: body.coords[0],
          lat: body.coords[1]
        };
        // Call callback function when API has successful responded
        callback(req, res, data);
      } else {
        // If check wasn’t successful, pass error through to _showError function
        _showError(req, res, response.statusCode);
      }
    }
  );
};

var renderDetailPage = function (req, res, locDetail) {
  // Reference specific items of data as needed for render jade file 'location-info'
  res.render('location-info', {
    title: locDetail.name,
    pageHeader: {title: locDetail.name},
    sidebar: {
      context: 'is on Loc8r because it has accessible wifi and space to sit ' +
      'down with your laptop and get some work done.',
      callToAction: 'If you\'ve been and you like it - or if you don\'t ' +
      'please leave a review to help other people just like you.'
    },
    // Pass full locDetail data object to view, containing all details
    location: locDetail
  });
};

/**
 * Handle 'Add review' page with get request
 * @param req
 * @param res
 */
module.exports.addReview = function (req, res) {
  // Also call getLocationInfo from addReview controller, but this time pass renderReviewForm  in callback
  getLocationInfo(req, res, function (req, res, responseData) {
    renderReviewForm(req, res, responseData);
  });
};

// Update renderReview-Form function to accept new parameter containing data
var renderReviewForm = function (req, res, locDetail) {
  res.render('location-review-form', {
    title: 'Review' + locDetail.name + ' on Loc8r',
    pageHeader: { title: 'Review ' + locDetail.name }
    //error: req.query.err  // Use client-side validation, disable validation error check from API and database
  });
};

/**
 * Handle 'Add review' page with post request
 * @param req
 * @param res
 */
module.exports.doAddReview = function (req, res) {
  var requestOptions, path, locationid, postdata;
  locationid = req.params.locationid;

  // Get location ID from URL to construct API URL
  path = "/api/locations/" + locationid + "/reviews";

  // Create data object to send to API using submitted form data
  postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };

  // Set request options, including path, setting POST method and passing submitted form data into json parameter
  requestOptions = {
    url: apiOptions.server + path,
    method: "POST",
    json: postdata
  };

  /* If any of three required data fields are falsey, then redirect to Add Review page,
   appending query string used to display error message */
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect('/location/' + locationid + '/reviews/new?err=val');
  } else {
    // Make the request to API of Database
    request(
      requestOptions,
      function (err, response, body) {
        if (response.statusCode === 201) {
          // Redirect to Details page if review was added successfully or show an error page if API returned an error
          res.redirect('/location/' + locationid);
        } else if (response.statusCode === 400 && body.name && body.name === "ValidationError") {
          // If true redirect to review form, passing an error flag in query string,
          // 'err' is passed in query object which is contained by req object
          res.redirect('/location/' + locationid + '/reviews/new?err=val');
        } else {
          _showError(req, res, response.statusCode)
        }
      }
    );
  }
};