const express = require("express");
const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const generateHasedPassword = require("../routes/bcrypt");
const nodemailer = require("nodemailer");

router.get("/signin", (req, res) => {
  res.send("Welcome to sign in Page");
});

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
      const link = `https://password-reset-serverapp.onrender.com/api/reset-password/${userData._id}/${token}`;
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
        res.status(201).send(`
        <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .container {
          background: linear-gradient(
            45deg,
            #e0fbfcff,
            #c2dfe3ff,
            #9db4c0ff,
            #5c6b73ff,
            #253237ff
          );
          color: whitesmoke;
          height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
  
        .form-container {
          margin: 4rem;
          padding: 1.5rem;
  
          height: auto;
          width: 40%;
          border: 2px solid rgb(0, 0, 0);
          border-radius: 5px;
        }
        @media screen and (max-width: 768px) {
          .form-container {
            width: 80%;
          }
        }
        .label-text {
          color: black;
          font-weight: 600;
          font-size: 1.2rem;
          text-align: left;
        }
        .input-field {
          height: 3rem;
          width: 100%;
          border: none;
          margin: 3% 0%;
          padding: 2%;
        }
        .submit-btn {
          height: 2.5rem;
          width: 35%;
          background: #1976d2;
          color: white;
          border: none;
          font-size: 16px;
          font-weight: 600;
          margin: 3% 0%;
        }
        .submit-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .link {
          text-decoration: none;
          color: white;
        }
      </style>
      // <script>
      //   const handleSubmit = async (e) => {
     
      //     const passwordInput = document.getElementById("password");
      //     const passwordToBeChanged = { password: passwordInput.value };
       
      //     try {
      //       const response = await fetch(
      //         "https://password-reset-serverapp.onrender.com/api/reset-password/${id}/${token}",
      //         {
      //           method: "POST",
      //           headers: {
      //             "Content-Type": "application/json",
      //           },
      //           body: JSON.stringify(passwordToBeChanged),
      //         }
      //       );
            
      //     return response.json()
      //     } catch (error) {
      //       console.error(error);
      //     }
      //   };
      //   };
      // </script>
      <div class="container">
      <h1>Reset Your Password</h1>

      <form action ="" method ="post" class="form-container">
        <input type="hidden" name="userId" value="${id}" />
        <input type="hidden" name="token" value="${token}" />
        <label for="password" class="label-text">New Password</label>
        <input
          type="password"
          name="password"
          id="password"
          required
          class="input-field"
          placeholder="Enter Your New Password"
        />
        <br />
        <label for="confirmPassword" class="label-text">Confirm Password</label>
        <input
          type="password"
          name="password"
          id="confirmPassword"
          class="input-field"
          required
          placeholder="Confirm Your Password"
        />
        <div class="submit-container">
        <button type="submit" class="submit-btn">
        Reset Password
      </button>
        </div>
      </form>
    </div>
      `);
      } else {
        res.status(403).send({ Message: "Not Verified " });
      }
    }
  } catch (error) {
    res.status(500).send(`Error While Connecting to Server- ${error}`);
  }
});

router.post("/reset-password/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;
    const userData = await Users.findById(id);
    const secret = process.env.MY_SECRET_KEY + userData.password;
    if (!userData) {
      res.status(404).send("User Does Not Exist");
    } else {
      const verifyToken = jwt.verify(token, secret);
      if (verifyToken) {
        const newPassword = req.body.password[0];
        const hashedPassword = await generateHasedPassword(newPassword);
        userData.password = hashedPassword;
        await userData.save();
        res.status(200).send("Password updated successfully");
      } else {
        res.status(403).send("Not Verified");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error while updating password-${error}`);
  }
});
module.exports = router;
