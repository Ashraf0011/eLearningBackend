const Joi = require("joi");
const passwordComplexity = require('joi-password-complexity');
const mongoose = require("mongoose");
const Schema = mongoose.Schema

const userSCHEMA = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  userID: { type: String },
}, { collection: "userData" })



const validateUserProfile = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    phone: Joi.string().required().label("Phone"),
    password: passwordComplexity().required().label("Password"),
    role: Joi.string().required().label("Role"),
    userID: Joi.string().label("userID")
  })

  return schema.validate(data);
}

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("email"),
    password: Joi.string().required().label("password")
  })

  return schema.validateAsync(data);
}

const USERPROFILE = mongoose.model("USER_SCHEMA", userSCHEMA)
module.exports = { USERPROFILE, validateUserProfile, validateLogin };