const express = require("express");
const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const generateHasedPassword = require("../routes/bcrypt");
const nodemailer = require("nodemailer");
const path = require("path");

router.get("/signin", (req, res) => {
  res.send("Welcome to sign in Page");
});

//API for SignUp
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
      res.status(403).send({ Error: `-${error}` });
    }
  }
});

//API for SignIn
router.post("/user/signin", async (req, res) => {
  try {
    const user = await Users.findOne({ name: req.body.name });
    if (!user) {
      res.status(404).send({ Message: "User Not Found.Please Sign Up" });
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

//API For Generating Password reset token

router.post("/user/passwordreset", async (req, res) => {
  try {
    const userData = await Users.findOne({ email: req.body.email });
    if (!userData) {
      res.status(404).json({ Message: "User Does Not Exists. Please Sign Up" });
    } else {
      const secret = process.env.MY_SECRET_KEY + userData.password;

      const token = jwt.sign(
        { email: userData.email, id: userData._id },
        secret,
        {
          expiresIn: "5m",
        }
      );
      const link = `https://password-reset-fe-akb.netlify.app/user/resetpassword/${userData._id}/${token}`;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_ID,
          pass: process.env.PASSWORD,
        },
      });

      const options = {
        from: process.env.GMAIL_ID,
        to: userData.email,
        subject: " Password Reset Verification",
        text: `We  have received Your Request for Password reset.
        Please Click on the Below Link to Reset Your Password
        ${link}
        
        `,
      };
      transporter.sendMail(options, (err, data) => {
        if (err) {
          res
            .status(403)
            .json({ Error: ` Error While Sending Reset Mail -${err}` });
        } else {
          res.status(200).json({ Message: "Mail Sent", link });
        }
      });

      // res.send(link);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: `Error While Connecting to db ${error}` });
  }
});

//API to Change Password
router.post("/reset-password/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    const userData = await Users.findById(id);
    const secret = process.env.MY_SECRET_KEY + userData.password;
    if (!userData) {
      res.status(404).send({ Message: "User Does Not Exist" });
    } else {
      const verifyToken = jwt.verify(token, secret);
      if (verifyToken) {
        const hashedPassword = await generateHasedPassword(password);
        userData.password = hashedPassword;
        await userData.save();
        res.status(200).send({ Message: "Password updated successfully" });
      } else {
        res.status(403).send({ Error: "Not Verified" });
      }
    }
  } catch (error) {
    res.status(500).send({ Error: `${error}` });
  }
});

module.exports = router;
