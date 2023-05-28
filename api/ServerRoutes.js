const express = require("express");
const { Router } = require("express");
const COURSE_SCHEMA = require("./CourseSchema")
const STUDENT_SCHEMA = require("./StudentSchema")
const MENTORS_SCHEMA = require("./MentorsSchema");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { validateProfileSignUp, PROFILE } = require("./SignUpSchema");


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

serverRoutes.route("/api/courses/create").post((req, res) => {
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
 * Students Signup
 */
serverRoutes.route("/api/students").get(async (req, res) => {
  await STUDENT_SCHEMA.find()
    .then((data) => { res.send(data) })
    .catch(e => { res.send(e) })
})

serverRoutes.route('/api/signup').post(async (req, res) => {
  console.log("signup info", req.body);
  const { email, password, firstName, lastName, phone } = req.body;


  const { error } = validateProfileSignUp(req.body);
  if (error) {
    return res.status(400).json({ message: `here error is: ${error}` });
  }

  const _existingUser = await STUDENT_SCHEMA.findOne({ email: req.body.email });
  if (_existingUser) {
    return res.status(409).statusMessage("user already exist with this email, use another email or try resetting password")
  }

  const hsahedPassword = await bcrypt.hash(password, 12);
  const userInformation = { firstName, lastName, email, phone, password: hsahedPassword, userType: "student", userID: `${email}` }
  await STUDENT_SCHEMA.create(userInformation)
    .then((data) => res.status(200).json({ message: "Account successfully created for", data }))
    .catch((e) => res.json({ status: 400, message: e }));
})

serverRoutes.route("/api/login").post(async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error)
      return res.status(400).json({ message: `here error is: ${error}` });


    const { email, password } = req.body
    const _existedUser = await STUDENT_SCHEMA.findOne({ email: email });
    console.log("user found", _existedUser);

    if (!_existedUser)
      return res.status(401).json({ message: "Invalid Email" });

    const validPass = await bcrypt.compare(
      password,
      _existedUser.password
    );

    if (!validPass)
      return res.status(401).json({ message: "Wrong password" });


    const { _id: id, firstName } = _existedUser;

    const token = jwt.sign({ id, firstName }, process.env.JWT_PRIVATE_KEY, { expiresIn: "1d" })

    res.status(200).send({ data: token, message: "Login Successful" });


  }
  catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
})

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("email"),
    password: Joi.string().required().label("password")
  })

  return schema.validateAsync(data);
}






module.exports = serverRoutes;