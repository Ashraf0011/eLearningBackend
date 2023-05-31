const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSCHEMA = new Schema({
  courseID: { type: String },
  courseName: { type: String },
  coursePrice: { type: Number },
  courseSubTitle: { type: String },
  numberOfRating: { type: Number },
  valueOfRating: { type: Number },
  courseRating: { type: Number },
  videoIDs: { type: Object },
  mentorID: { type: String },
  mentorName: { type: String },
  category: { type: String },
  lessons: { type: Number },
  hours: { type: Number },
}, { collection: "courseData" })

module.exports = mongoose.model("COURSE_SCHEMA", CourseSCHEMA);