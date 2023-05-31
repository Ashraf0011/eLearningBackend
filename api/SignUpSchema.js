const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");
const passwordComplexity = require('joi-password-complexity');

const Profile = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
})

const validateProfileSignUp = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    phone: Joi.string().required().label("Phone"),
    password: passwordComplexity().required().label("Password"),
    role: Joi.string().required().label("Role")
  })

  return schema.validate(data);
}
const PROFILE = mongoose.model("PROFILE", Profile);
module.exports = { PROFILE, validateProfileSignUp };
