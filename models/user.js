const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

// This automatically adds username, hash, salt fields and authentication methods
userSchema.plugin(passportLocalMongoose);

// Export the User model based on the userSchema
module.exports = mongoose.model("User", userSchema);
