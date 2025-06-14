const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require('../middleware');
const users = require("../controllers/users");

router.route("/register")
    .get(users.renderRegisterForm)
    .post(catchAsync(users.registerUser));

router.route("/login")
    .get(users.renderLoginForm)
    .post(
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    // Now we can use res.locals.returnTo to redirect the user after login
    users.login    
);

//By using the storeReturnTo middleware function, we can save the returnTo value to res.locals before passport.authenticate() clears the session and deletes req.session.returnTo. This enables us to access and use the returnTo value (via res.locals.returnTo) later in the middleware chain so that we can redirect users to the appropriate page after they have logged in.

router.get('/logout', users.logout); 

module.exports = router;