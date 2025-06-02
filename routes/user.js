const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  // Handle POST request for user signup
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  // Handle GET request for the login page
  .get(userController.renderLoginForm)
  // Handle POST request for login
  .post(
    saveRedirectUrl,
    // Use Passport's "local" strategy to authenticate the user
    passport.authenticate("local", {
      // If login fails, redirect back to the login page
      failureRedirect: "/login",
      // Enable flash message on failure (like "Invalid username or password")
      failureFlash: true,
    }),
    // If login succeeds, this function runs
    userController.login
  );

// Handle GET request to log out the user
router.get("/logout", userController.logout);

module.exports = router;
