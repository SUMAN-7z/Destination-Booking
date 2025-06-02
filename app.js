if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Import route modules for listings, reviews and user
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";
const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in Mongo session store", err);
});

// Session configuration options
const sessionOptions = {
  store,
  secret: process.env.SECRET, // Secret key used to sign the session ID cookie (keep this safe and private)
  resave: false, // Don't save session if it wasn't modified during the request (improves performance)
  saveUninitialized: true, // Save new sessions that are uninitialized (new but no data set yet)
  cookie: {
    // Set the cookie to expire in 7 days from now (as a specific Date object)
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    // Set the maximum age of the cookie to 7 days (in milliseconds)
    // After this duration, the cookie will be automatically removed by the browser
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Apply the session middleware to the Express app with the given options
app.use(session(sessionOptions));

// Use the `flash` middleware to enable flash messages (temporary messages stored in session)
app.use(flash());

// Initialize Passport for authentication handling
app.use(passport.initialize());

// Enables persistent login sessions using data from the session store
// This lets Passport store the logged-in user’s ID in the session and retrieve them on each request
app.use(passport.session());

// Sets up Passport to use the local strategy with the User model's built-in authentication method from passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));

// Tells Passport how to store user information in the session (only the user ID is stored)
passport.serializeUser(User.serializeUser());
// Tells Passport how to retrieve full user details from the session using the stored ID
passport.deserializeUser(User.deserializeUser());

// Custom middleware to make flash messages available in all templates/views
app.use((req, res, next) => {
  // Assign any flash message with key "success" to res.locals.success
  // This allows you to access it in your views like: <%= success %>
  res.locals.success = req.flash("success");
  // Assign any flash message with key "error" to res.locals.error
  // This allows you to access it in your views like: <%= error %>
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  // Proceed to the next middleware or route handler
  next();
});

// Use listingRouter to handle all routes starting with /listings
app.use("/listings", listingRouter);
// Use reviewRouter to handle all routes starting with /listings/:id/reviews
app.use("/listings/:id/reviews", reviewRouter);
// Use userRouter to handle all routes starting with /signup
app.use("/", userRouter);

//page not found
app.use((req, res, next) => {
  next(new ExpressError(404, "page Not Found!"));
});

//Middlewares
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
  console.log("server is listening to 8080");
});
