var express = require('express');
var router = express.Router();

// Get controller for every page
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

/* Location pages */
router.get('/', ctrlLocations.homelist);
router.get('/location', ctrlLocations.locationInfo);
router.get('/location/review/new', ctrlLocations.addReview);

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
