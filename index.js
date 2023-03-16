const express = require("express");
require("dotenv").config();
const connection = require("./db/connection");
const cors = require("cors");
const app = express();
app.use(express.json());
connection();

app.use(cors({ origin: "http://localhost:3000" }));

const signInRoutes = require("./routes/signin");

const PORT = 5000;
app.use(signInRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Password reset app");
});
app.listen(PORT, () => {
  console.log(`Server Started and Listening to the Port - ${PORT}`);
});
