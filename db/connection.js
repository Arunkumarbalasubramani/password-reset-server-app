const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Mongo DB is Now Connected");
  } catch (error) {
    console.log(error);
  }
};
module.exports = connection;
