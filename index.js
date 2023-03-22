const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const connection = require("./db/connection");
const cors = require("cors");
const app = express();
const Users = require("./models/userModel");
const jwt = require("jsonwebtoken");
connection();
app.set("view engine", "ejs");
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
const signInRoutes = require("./routes/signin");

const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Welcome to Password reset app");
});

// app.post("/user/passwordreset", async (req, res) => {
//   console.log("Entered");
//   console.log(req.body);
//   try {
//     const userData = await Users.findOne({ email: req.body.email });
//     if (!userData) {
//       res.status(404).json({ Message: "User Does Not Exists. Please Sign Up" });
//     } else {
//       console.log("Line 61");
//       const secret = process.env.MY_SECRET_KEY + userData.password;

//       const token = jwt.sign(
//         { email: userData.email, id: userData._id },
//         secret,
//         {
//           expiresIn: "5m",
//         }
//       );
//       console.log(token);
//       const link = `http://localhost:5000/reset-password/${userData._id}/${token}`;

//       // res.send(link);
//       res.status(200).json({ link });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ Error: `Error While Connecting to db ${error}` });
//   }
// });

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );

//   app.options("*", (req, res) => {
//     // allowed XHR methods
//     res.header(
//       "Access-Control-Allow-Methods",
//       "GET, PATCH, PUT, POST, DELETE, OPTIONS"
//     );
//     res.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     );
//     // res.send();
//     next();
//   });
// });

app.use("/api", signInRoutes);

app.listen(PORT, () => {
  console.log(`Server Started and Listening to the Port - ${PORT}`);
});
