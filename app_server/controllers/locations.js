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

/* Get 'home' page (homepage) */
//module.exports.homelist = function (req, res) {
//  renderHomepage(req, res);
//};

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

    //locations: [{
    //  name: 'Starups',
    //  address: '125 High Street, Reading, RG6 2PS',
    //  rating: 3,
    //  facilities: ['Hot drinks', 'Food', 'Premium wifi'],
    //  distance: '100m'
    //}, {
    //  name: 'Cafe Hero',
    //  address: '125 High Street, Reading, RG6 5PS',
    //  rating: 4,
    //  facilities: ['Hot drinks', 'Food', 'Premium wifi'],
    //  distance: '200m'
    //}, {
    //  name: 'Burger Queen',
    //  address: '125 High Street, Reading, RG6 1PS',
    //  rating: 2,
    //  facilities: ['Food', 'Premium wifi'],
    //  distance: '250m'
    //}]
  });
};

/**
 * Get 'Location info' page, show the location details
 * @param req
 * @param res
 */
module.exports.locationInfo = function (req, res) {
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
      // Reset coords property to be an object, setting lng and lat using values pulled from API response
      data.coords = {
        lng: body.coords[0],
        lat: body.coords[1]
      };

      // Call renderDetailPage function when API has responded
      renderDetailPage(req, res, data);
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


    //location: {
    //  name: 'Starcups',
    //  address: '125 High Street, Reading, RG6 1PS',
    //  rating: 3,
    //  facilities: ['Hot drinks', 'Food', 'Premium wifi'],
    //  coords: {lat: 51.455041, lng: -0.9690884},
    //  // Data for opening hours is held as an array of objects
    //  openingTime: [{
    //    days: 'Monday - Friday',
    //    opening: '7:00am',
    //    closing: '7:00pm',
    //    closed: false
    //  }, {
    //    days: 'Saturday',
    //    opening: '8:00am',
    //    closing: '5:00pm',
    //    closed: false
    //  }, {
    //    days: 'Sunday',
    //    closed: true
    //  }],
    //  // Reviews are also passed to the view as array of objects
    //  reviews: [{
    //    author: 'Simon Holmes',
    //    rating:5,
    //    timestamp: '16 Jan 2016',
    //    reviewText: 'What a great place. I can\'t say enough good things about it.'
    //  }, {
    //    author: 'Charlie Chaplin',
    //    rating: 3,
    //    timestamp: '5 Jan 2016',
    //    reviewText: 'It was okay. Coffee wasn\'t great, but the wifi was fast.'
    //  }]
    //}
  });
};

/* Get 'Add review' page */
module.exports.addReview = function (req, res) {
  res.render('location-review-form', {
    title: 'Review Starcups on Loc8r',
    pageHeader: { title: 'Review Starups' }
  });
};