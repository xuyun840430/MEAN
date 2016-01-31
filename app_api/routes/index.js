/**
 * Created by Information on 2016/1/29.
 *
 * As app_api folder will hold everything specific to the API:
 * routes, controllers, and models.The index.js module hold all
 * of the routes we’ll use in the API.
 */
var express = require('express');
var router = express.Router();

// Include controller file (we’ll create this next)
var ctrlLocations = require('../controllers/locations');
var ctrlReviews = require('../controllers/reviews');

/**
 * we don’t specify /api at the front of the path. We specify in app.js that these
 * routes should only be used if the path starts with /api, so it’s assumed that all
 * routes specified in this file will be prefixed with /api.
 */

// Define routes for locations
router.get('/locations', ctrlLocations.locationsListByDistance);
router.post('/locations', ctrlLocations.locationsCreate);
router.get('/locations/:locationid', ctrlLocations.locationsReadOne);
router.put('/locations/:locationid', ctrlLocations.locationsUpdateOne);
router.delete('/locations/:locationid', ctrlLocations.locationsDeleteOne);

// Define routes for reviews
router.post('/locations/:locationid/reviews', ctrlReviews.reviewsCreate);
router.get('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsReadOne);
router.put('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsUpdateOne);
router.delete('/locations/:locationid/reviews/:reviewid', ctrlReviews.reviewsDeleteOne);

// Export routes
module.exports = router;
