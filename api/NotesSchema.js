const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notesSchema = new Schema({
  userID: { type: String, required: true },
  videoID: { type: String, required: true },
  time: { type: String, required: true },
  text: { type: String, required: true },
}, { collection: "notesData" })

const validateNotes = (data) => {
  const schema = Joi.object({
    userID: Joi.string().required().label("User_ID"),
    videoID: Joi.string().required().label("Video_ID"),
    time: Joi.string().required().label("Time"),
    text: Joi.string().required().label("Text")
  })
  return schema.validate(data);
}

const NOTES_SCHEMA = mongoose.model("NOTES_SCHEMA", notesSchema);
module.exports = { NOTES_SCHEMA, validateNotes };