const express = require("express");
const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const router = express.Router();
const generateHasedPassword = require("../routes/bcrypt");
router.get("/signin", (req, res) => {
  res.send("Welcome to sign in Page");
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

module.exports = router;
