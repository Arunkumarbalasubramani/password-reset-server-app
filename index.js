const express = require("express");
require("dotenv").config();
const connection = require("./db/connection");
const app = express();
app.use(express.json());
const signInRoutes = require("./routes/signin");
connection();

const PORT = 5000;
app.use(signInRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Password reset app");
});
app.listen(PORT, () => {
  console.log(`Server Started and Listening to the Port - ${PORT}`);
});
