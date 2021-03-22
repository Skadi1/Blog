const { Router } = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const config = require("config");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const fs = require("fs");
// const fileUpload = require('express-fileupload');

const multer = require("multer");
const { db } = require("../models/User");
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "/filepath");
//   },

//   filename: function (req, file, cb) {
//     let filename = "av";
//     req.body.file = filename;

//     cb(null, filename);
//   },
// });
const upload = multer({ dest: "uploads/" });
//*
let router = Router();
//*
router.post(
  "/register",
  [
    check("email", "Email is not corect").isEmail(),
    check("password", "Password is not corect").isLength({ min: 5 }),
    check("FirstName", "FirstName is not corect").isLength({ min: 3 }),
    check("LastName", "LastName is not corect").isLength({ min: 3 }),
  ],
  async (req, res) => {
    try {
      console.log(req.body);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(500).json({ message: "Ivalid data" });
      }

      const { FirstName, LastName, email, password } = req.body;

      const existing = await User.findOne({ email });

      if (existing) {
        return res
          .status(500)
          .json({ message: "A user with that email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        FirstName,
        LastName,
        email,
        password: hashedPassword,
      });

      await user.save();

      return res
        .status(201)
        .json({ email, password, message: "User has been created" });
    } catch (error) {
      res.status(500).json({ message: "Error from router", error });
      console.log(error);
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Email is not corect").isEmail(),
    check("password", "Password is not corect").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      // res.status(500).json({ message: 'Tralalal' })
      const errors = validationResult(req.body);

      if (!errors.isEmpty()) {
        res.status(500).json({ message: "Ivalid data", error: errors });
      }
      //*
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(500).json({ message: "That user doesnt exists" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(500).json({ message: "Incorect password" });
      }

      const token = jwt.sign({ userId: user.id }, config.get("JWTsecretKey"), {
        expiresIn: "1h",
      });

      return res
        .status(200)
        .json({ token, userId: user.id, message: "User have been logged" });
    } catch (error) {
      res.status(500).json({ message: "Error from router" });
    }
  }
);



module.exports = router;
