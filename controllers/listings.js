const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  // Check if the listing does not exist
  if (!listing) {
    // Store an error message in the session to be shown after redirect
    req.flash("error", "Listing you requested for does not exist!");
    // Redirect the user back to the listings page
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  // Assign the currently logged-in user's ID as the owner of the new listing
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  // Store a success flash message in the session to show after redirect
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  // If no listing is found (possibly due to an invalid ID or it was deleted)
  if (!listing) {
    // Store an error flash message in the session
    req.flash("error", "Listing you requested for does not exist!");
    // Redirect the user back to the listings page
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing ,originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  //The ... syntax in JavaScript can be a spread operator, used to expand elements of arrays or objects, or a rest operator, used to collect multiple elements into an array or object. The spread operator spreads elements, while the rest operator gathers remaining elements.
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  // Store a success flash message in the session to show after redirecting
  req.flash("success", "Listing Updated !!!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  // Store a success flash message to notify the user that the listing was deleted
  req.flash("success", "Listing Deleted !!!");
  res.redirect("/listings");
};
