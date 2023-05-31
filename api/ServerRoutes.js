const express = require("express");
const { Router } = require("express");
const COURSE_SCHEMA = require("./CourseSchema")
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { validateProfileSignUp, PROFILE } = require("./SignUpSchema");
const { validateUserProfile, validateLogin, USERPROFILE, } = require("./UsersSchema");
const { NOTES_SCHEMA, validateNotes } = require("./NotesSchema");


const serverRoutes = Router();
serverRoutes.use(express.json());
serverRoutes.use(express.urlencoded({ extended: false }));

serverRoutes.route("/api").get((req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("backend Connected");
  res.json({ status: "you are here" })
});

/**
 * Courses
 */

serverRoutes.route("/api/courses").get((req, res) => {
  COURSE_SCHEMA.find()
    .then((data) => { res.send(data) })
    .catch(e => { res.send(e) })
})

serverRoutes.route("/api/courses").post((req, res) => {
  console.log("Create request Recieved for", req.body);
  COURSE_SCHEMA.create(req.body)
    .then((data) => { res.send(data) })
    .catch(e => res.send(e))
})

/**
 * Mentors
 */
serverRoutes.route("/api/mentors").get((req, res) => {
  MENTORS_SCHEMA.find()
    .then((data) => { res.send(data) })
    .catch(e => { res.send(e) })
})




/**
 * get users
 */
serverRoutes.route("/api/users").get(async (req, res) => {
  try {
    const users = await USERPROFILE.find().select("-password").lean()
    if (!users?.length) {
      return res.status(400).json({ message: "No users not Found!" })
    }
    res.status(200).json(users)
  } catch (err) {
    res.send(err)
  }
})


/**
 * USER SIGNUP
 */
serverRoutes.route('/api/users').post(async (req, res) => {
  console.log("signup info", req.body);
  const { email, password, firstName, lastName, phone, role } = req.body;

  const { error } = validateProfileSignUp(req.body);
  if (error) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // if existing
  const _existingUser = await USERPROFILE.findOne({ email }).lean().exec()
  if (_existingUser) {
    return res.status(409).statusMessage("User already exist with this email, use another email or try resetting password")
  }

  // Hash password
  const hsahedPassword = await bcrypt.hash(password, 12); // 12 salt rounds
  const userInformation = { firstName, lastName, email, phone, "password": hsahedPassword, userID: `${email}`, role }

  // create user
  try {
    const user = await USERPROFILE.create(userInformation)
    if (user) {
      res.status(200).json({ message: `Account successfully created for: ${user.firstName}` })
    }
  } catch (e) {
    res.status(400).json({ message: "invalid user data" })
  }
})

/***
 * USER LOGIN
 *
 *  ***/

serverRoutes.route("/api/users").post(async (req, res) => {
  try {
    console.log("trying to log you in");
    const { error } = validateLogin(req.body);
    if (error)
      return res.status(400).json({ message: `here error is: ${error}` });

    const { email, password } = req.body
    const _existedUser = await PROFILE.findOne({ email: email });
    console.log("user found", _existedUser);

    if (!_existedUser)
      return res.status(401).json({ message: "Invalid Email" });

    const validPass = await bcrypt.compare(
      password,
      _existedUser.password
    );
    if (!validPass)
      return res.status(401).json({ message: "Wrong password" });


    const token = jwt.sign({ email }, process.env.JWT_PRIVATE_KEY, { expiresIn: "1d" })

    res.status(200).send({
      token: token,
      message: "Login Successful"
    });


  }
  catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
})

/**
 * UPDATE USER
 */

serverRoutes.route("/api/users").patch(async (req, res) => {
  console.log("try update");
  const { email, firstName, lastName, password, phone } = req.body;

  // update
  try {
    // email is used as userID
    const user = await USERPROFILE.findOne({ email }).exec();
    if (!user?.length) {
      return res.status(400).json({ message: "user not found in database" });
    }

    // updating values recieved
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;

    if (password) {
      user.password = await bcrypt.hash(password, 12); // 12 salt rounds
    }

    const updatedUser = await user.save();
    console.log("updated successfull");
    res.status(200).json({ message: `${updatedUser.firstName} ${updatedUser.lastName},${updatedUser.phone} and password updated.` })
  } catch (e) {
    res.send(e);
  }
})


/**
 * DELETE USER
 */

serverRoutes.route("/api/users").delete(async (req, res) => {
  console.log("try delete");
  const { email, password, userID } = req.body;

  // validate data

  if (!email || !password || userID) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // delete
  try {
    const user = await USERPROFILE.findById({ userID }).exec();
    if (!user) {
      return res.status(400).json({ message: "user not found in database" });
    }

    const result = await user.deleteOne();
    res.status(200).json({ message: `${result.firstName} was deleted.` })

  } catch (e) {
    res.send(e);
  }
})

/***
 * Notes Get using post
 */

serverRoutes.post("/api/notes/get", async (req, res) => {
  try {
    console.log("getting all notes for current video");
    const { videoID, userID } = req.body;
    // const result = await NOTES_SCHEMA.find().exec()
    const result = await NOTES_SCHEMA.find()
      .where({ videoID: videoID })
      .where({ userID: userID }).exec()
    if (!result?.length) {
      return res.status(400).json({ message: "No notes found" })
    }
    res.status(200).json(result);
  }
  catch (e) {
    res.status(500).json({ message: `Unexpected Error at${e}` })
  }
})
/***
 * Notes Create
 */
serverRoutes.post("/api/notes", async (req, res) => {
  try {
    console.log("Taking a new Note");
    const { videoID, userID, time, text } = req.body;
    const { error } = validateNotes(req.body);

    if (error) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await NOTES_SCHEMA.create({ videoID, userID, time, text });

    console.log("Noted created", result);
    res.status(200).json({ message: `Note was added` })
  }
  catch (e) {
    res.status(500).json({ message: `Unexpected Error at${e}` })
  }
})



serverRoutes.patch("/api/notes", async (req, res) => {
  try {
    console.log("updating");
    const { _id, time, text } = req.body;
    const _existingNote = await NOTES_SCHEMA.findOne({ _id }).exec();
    if (!_existingNote) {
      return res.status(404).json({ message: "No notes found" })
    }
    _existingNote.time = time;
    _existingNote.text = text;
    const updatedNote = await _existingNote.save();

    res.status(200).json({ message: `Selected note was updated ${updatedNote.text}` })
  }
  catch (e) {
    res.status(500).json({ message: `Unexpected Error ${e}` })
  }
})


serverRoutes.delete("/api/notes", async (req, res) => {
  try {
    console.log("deleting");
    const { _id } = req.body
    const note = await NOTES_SCHEMA.findOne({ _id: _id }).exec();
    console.log("note", note);
    if (!note?.length) {
      return res.status(404).json({ message: "No such notes exist" })
    }
    const deleted = await note.deleteOne()
    res.status(200).json({ message: `Following Notes were deleted ${deleted}` })
  }
  catch (e) {
    res.status(500).json({ message: `Unexpected Error at${e}` })
  }
})



module.exports = serverRoutes;