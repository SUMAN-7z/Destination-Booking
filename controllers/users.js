const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, password, email } = req.body;
    let newUser = new User({ username, email });
    let registeredUser = await User.register(newUser, password);
    // Log in the user automatically after registration
    req.login(registeredUser, (err) => {
      if (err) {
        // If there's an error during login, pass it to the error handler
        return next(err);
      }
      // On successful login, show a success flash message
      req.flash("success", `Welcome to Airbnb ${req.user.username}`);
      // Redirect the user to the listings page
      res.redirect("/listings");
    });
  } catch (err) {
    // If an error occurs during registration (like duplicate email), show error message
    req.flash("error", err.message);
    // Redirect the user back to the signup page
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    // Show a welcome back message
    req.flash("success", `Welcome back ${req.user.username} to Airbnb !!!`);
    // Check if a redirect URL was stored earlier (e.g., the page the user tried to visit before login)
    // If not, use "/listings" as the default redirect destination
    let redirectUrl = res.locals.redirectUrl || "/listings";
    // Redirect the user to the appropriate url store in redirectUrl after login
    res.redirect(redirectUrl);
  }

  module.exports.logout = (req, res, next) => {
  // Log out the currently logged-in user
  req.logout((err) => {
    if (err) {
      // If there's an error during logout, pass it to the error handler
      return next(err);
    }
    // Show a success message to the user
    req.flash("success", "You are logged out!");
    // Redirect the user to the listings page (or home page)
    res.redirect("/listings");
  });
}
