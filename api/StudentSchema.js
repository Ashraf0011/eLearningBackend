const mongoose = require("mongoose");
const Schema = mongoose.Schema
const studentSCHEMA = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  userType: { type: String },
  userID: { type: String },
  courseName: { type: Array },
  notes: { type: Object },
  porgress: { type: Object }
}, { collection: "studentsData" })


module.exports = mongoose.model("STUDENT_SCHEMA", studentSCHEMA)