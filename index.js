const express = require("express");
require("dotenv").config();
const connection = require("./db/connection");
const cors = require("cors");
const app = express();
app.use(express.json());
connection();

app.use(cors());

const signInRoutes = require("./routes/signin");

const PORT = 5000;
app.use(signInRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Password reset app");
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.listen(PORT, () => {
  console.log(`Server Started and Listening to the Port - ${PORT}`);
});
