const mongoose = require("mongoose");
const Schema = mongoose.Schema

const mentorsSCHEMA = new Schema({
  userType: { type: String },
  userName: { type: String },
  userEmail: { type: String },
  userID: { type: String },
  userPassWord: { type: String },
  courseName: { type: Array },
  notes: { type: Object },
  subscribedStudennts: { type: Array }
}, { collection: "mentorsData" })


module.exports = mongoose.model("MENTORS_SCHEMA", mentorsSCHEMA)