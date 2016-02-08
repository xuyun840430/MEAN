var express = require('express');
var router = express.Router();

// Get controller for every page
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

/* Location pages */
router.get('/', ctrlLocations.homelist);
// Add locationid parameter to route for single location
router.get('/location/:locationid', ctrlLocations.locationInfo);
// Insert locationid parameter into existing route for review form
router.get('/location/:locationid/reviews/new', ctrlLocations.addReview);
// Create new route on same URL but using POST method and referencing different controller
router.post('/location/:locationid/reviews/new', ctrlLocations.doAddReview);

/* Other pages */
router.get('/about', ctrlOthers.about);

module.exports = router;


/**
 * Default Implementation Code
 */
/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});

//// Take anonymous function and define it as a named function
//var homepageController = function (req, res) {
//  res.render('index', { title: 'Express' });
//};
