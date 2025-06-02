const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.postReview = async (req, res) => {
    // Find the listing by ID from the URL params
    let listing = await Listing.findById(req.params.id);
    // In show.ejs, inputs named "Review[rating]" & "Review[comment]" are stored in req.body.review
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    // Add the new review to the listing's reviews array
    listing.reviews.push(newReview);
    // Save the new review to the database
    await newReview.save();
    // Since we modified the listing document (added a review), save the updated listing
    // .save() is asynchronous, so we await it
    await listing.save();
    // Store a success flash message to confirm that a new review was successfully created
    req.flash("success", "New Review Created !!!");
    // Redirect back to the listing’s detail page
    res.redirect(`/listings/${listing._id}`);
  }

  module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    // Store a success flash message to confirm that the review was deleted
    req.flash("success", "Review Deleted !!!");
    res.redirect(`/listings/${id}`);
  }