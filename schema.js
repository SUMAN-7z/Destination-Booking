//this is (JOI library) mongoose schema this is server side schema. to control the error validation
const Joi = require("joi");

//this Schema for the Update Route &  Create Route server side validation schema
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(1),
    image: Joi.string().allow("", null),
  }).required(),
});

//this Schema for the Review server side validation schema
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});
