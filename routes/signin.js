const express = require("express");
const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const generateHasedPassword = require("../routes/bcrypt");

router.get("/signin", (req, res) => {
  res.send("Welcome to sign in Page");
});

router.post("/user/passwordreset", async (req, res) => {
  try {
    const userData = await Users.findOne({ email: req.body.email });
    if (!userData) {
      res.status(404).json({ Message: "User Does Not Exists. Please Sign Up" });
    } else {
      console.log("Line 61");
      const secret = process.env.MY_SECRET_KEY + userData.password;

      const token = jwt.sign(
        { email: userData.email, id: userData._id },
        secret,
        {
          expiresIn: "5m",
        }
      );

      const link = `http://localhost:5000/reset-password/${userData._id}/${token}`;

      // res.send(link);
      res.status(200).json({ link });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: `Error While Connecting to db ${error}` });
  }
});
router.post("/user/signup", async (req, res) => {
  const userName = req.body.name;

  const isUser = await Users.findOne({ name: userName });
  if (isUser) {
    res.status(403).send({ Message: "User Exists Already. Please Sign In" });
    return;
  } else {
    const passwordTobeHashed = req.body.password;
    const hashedPassword = await generateHasedPassword(passwordTobeHashed);
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    };
    const user = new Users(userData);
    try {
      const saveUser = await user.save();
      res.status(201).send({ Message: " User SignedUp Successfully" });
    } catch (error) {
      res.status(403).send(`Error While Signing Up -${error}`);
    }
  }
});

router.post("/user/signin", async (req, res) => {
  try {
    const user = await Users.findOne({ name: req.body.name });
    if (!user) {
      res.status(401).send({ Message: "User Not Found.Please Sign Up" });
    } else {
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (isMatch) {
        res.status(201).send("User Logged in successfully");
      } else {
        res.status(403).send("Wrong Credentials");
      }
    }
  } catch (error) {
    res.status(404).send(`Error While Sigining In -${error}`);
  }
});

router.get("/reset-password/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;
    const userData = await Users.findById(id);
    const secret = process.env.MY_SECRET_KEY + userData.password;
    if (!userData) {
      res.status(404).send("User Does Not Exist");
    } else {
      const verifyToken = jwt.verify(token, secret);
      if (verifyToken) {
        res.status(201).send("User Verified Successfully");
      } else {
        res.status(403).send({ Message: "Not Verified " });
      }
    }
  } catch (error) {
    res.status(500).send(`Error While Connecting to Server- ${error}`);
  }
});

module.exports = router;
