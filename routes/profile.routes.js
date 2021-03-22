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
async function updateData(newData, user) {
  for (const property in newData) {
    if (user[property]) {
      user[property] = newData[property];
      // console.log("that field not exists", property);
    } else {
      // console.log("that field not exists", property);
      return res.status(401).json({ message: "A problem" });
    }
  }
  await user.save();
}
//
router.get(
  "/smallData/:id",

  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      const userData = {
        FirstName: user.FirstName,
        LastName: user.LastName,
        email: user.email,
        userId: id,
      };
      if (user.ProfileImage.data) {
        userData.dataImage = user.ProfileImage.data.toString("base64");
      }

      return res
        .status(201)
        .json({ userData, message: "Data has been sended" });
    } catch (error) {
      res.status(500).json({ message: "Error from router", error });
    }
  }
);
//
router.post(
  "/updateData/:id",
  upload.any(),

  async (req, res) => {
    try {
      const { id } = req.params;
      const { email, FirstName, LastName } = req.body;
      //
      const newData = { email, FirstName, LastName };
      //
      if (req.files[0]) {
        const imageProfile = fs.readFileSync(req.files[0].path);
        const encode_image = imageProfile.toString("base64");
        //
        const ProfileImage = {
          data: Buffer.from(encode_image, "base64"),
          contentType: req.files[0].mimetype,
        };
        newData.ProfileImage = ProfileImage;
      }
      //
      const user = await User.findById(id);
      //
      await updateData(newData, user);
      //

      return res.status(201).json({ user, message: "Data has been seted" });
      //
    } catch (error) {
      res.status(500).json({ message: "Error from router", error });
      console.log(error);
    }
  }
);

router.post("/img", upload.any(), async (req, res) => {
  try {
    var img = fs.readFileSync(req.files[0].path);
    var encode_image = img.toString("base64");

    const user = await User.findById(id);

    return res.json({ data: user.ProfileImage.data.toString("base64") });

    // await User.updateMany({
    //   ProfileImage: {
    //     data: Buffer.from(encode_image, "base64"),
    //     type: req.files[0].mimetype,
    //   },
    // });

    // await user.save();
    // const base64 = fs.readFileSync(user.ProfileImage.data, "base64");
    // Convert base64 to buffer => <Buffer ff d8 ff db 00 43 00 ...
    // const buffer = Buffer.from(base64, "base64");
    // const imge = fs.writeFileSync("new-path.png", buffer);
    // res.contentType('image/png');
    // res.send(imge)

    // return res.sendFile('stack-abuse-logo-out.png')
    // res.contentType('image/png')
    return res.json({ data: user.ProfileImage.data.toString("base64") });

    return res.status(200).json({ l: "adsad", message: "IMG is Well" });
  } catch (error) {
    res
      .status(500)
      .json({ file: req.files[0].originalname, message: "Error from router" });
  }
});

module.exports = router;
