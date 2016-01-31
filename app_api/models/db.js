/**
 * Created by Information on 2016/1/26.
 */


/**
 * Define database connection string and use it to open Mongoose connection
 */
var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/Loc8r';
mongoose.connect(dbURI);

/**
 *  Listen for Mongoose connection events and output statuses to console
 */
// Monitoring for successful connection through Mongoose
mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + dbURI);
});

// Checking for connection error
mongoose.connection.on('error', function () {
  console.log('Mongoose connected error: ' + dbURI);
});

// Checking for disconnection event Licensed to
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});

/**
 * Listen to Node processes for termination or restart signals, and call
 * gracefulShutdown function when appropriate, passing a continuation callback
 */
// Listen for SIGUSR2, which is what nodemon uses
process.once('SIGUSR2', function () {
  // Send message to graceful- Shutdown and callback to kill process, emitting SIGUSR2 again
  gracefulShutdown('nodemon restart', function () {
    process.kill(process.id, 'SIGUSR2')
  });
});

// Listen for SIGINT emitted on application termination
process.on('SIGINT', function () {
  gracefulShutdown('app termination', function () {
    // Send message to gracefulShutdown and callback to exit Node process
    process.exit(0);
  });
});

// Listen for SIGTERM emitted when Heroku shuts down process
process.on('SIGTERM', function () {
  gracefulShutdown('Heroku app shutdown', function () {
    process.exit();
  });
});



// Reusable function to close Mongoose connection
var gracefulShutdown = function (msg, callback) {
  // Close Mongoose connection, passing through an anonymous function to run when closed
  mongoose.connection.close(function () {
    // Output message and call callback when Mongoose connection is closed
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};


require('./locations');