const mongoose = require("mongoose");
require("dotenv").config();
const db = async () => {
  await mongoose
  .connect(
    process.env.MONGODB_URI
  )
  .then(() => {
    console.log("Connected to MongoDB");
  }).catch((err) => {
    console.log(err);
  });
};
module.exports = db;