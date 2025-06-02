const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
//joi scema require
const { listingSchema, reviewSchema } = require("./schema.js");

// Exporting a middleware function named 'isLoggedIn'
module.exports.isLoggedIn = (req, res, next) => {
  // Save the URL the user was trying to access before being redirected to login
  req.session.redirectUrl = req.originalUrl;
  // Check if the user is not authenticated (i.e., not logged in)
  if (!req.isAuthenticated()) {
    // Store an error message in the flash to show on the next page
    req.flash("error", "You must be logged in first!");
    // Redirect the user to the login page
    return res.redirect("/login");
  }
  // If user is logged in, proceed to the next middleware or route handler
  next();
};

// Middleware to transfer redirect URL from session to response locals
module.exports.saveRedirectUrl = (req, res, next) => {
  // Check if there's a saved redirect URL in the session
  if (req.session.redirectUrl) {
    // Make it available to the response (e.g., in a route handler after login)
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  // Proceed to the next middleware or route handler
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of the listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

//joi listing_schema validation middleware
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//joi review_schema validation middleware
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
