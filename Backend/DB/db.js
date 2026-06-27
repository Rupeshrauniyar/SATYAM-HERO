const mongoose = require("mongoose");
require("dotenv").config();

async function db() {
  try {
    console.log("URI:", process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
}

module.exports = db; 