const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const helmet = require("helmet");
// const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
app.use(express.json());
app.use(cors());
app.use(helmet());
// app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
const User = require("./Models/UserModel");
const Message = require("./Models/MessageModel");
mongoose
  .connect(
    "mongodb+srv://rouniyarmukesh12_db_user:erv4Zsncg69CMAGj@cluster0.fw0fbd2.mongodb.net/?appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.post("/api/check", async (req, res) => {
  try {
    const data = req.body;
    console.log(data.token);
    if (!data.token) {
      return res.json({
        success: false,
      });
    }
    const ver = jwt.verify(data.token, "satyam");
    if (ver) {
      const user = await User.findById(ver._id);
      if (user) {
        res.json({
          success: true,
          user,
        });
      } else {
        res.json({
          success: false,
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
    });
  }
});

app.post("/api/send", async (req, res) => {
  const { message, userId } = req.body;
  try {
    const newMessage = new Message({
      message: message,
      userId: userId,
    });
    await newMessage.save();
    res.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
    const token = jwt.sign({ _id: user._id }, "satyam");

    res.json({
      success: true,
      user,
      token,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/signup", async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(404).json({
        success: false,
        message: "User already exists",
      });
    }
    const newUser = new User({
      email: email,
      name: name,
      password: password,
      role: "user",
    });
    await newUser.save();
    const token = jwt.sign({ _id: newUser._id }, "satyam");

    res.json({
      success: true,
      user: newUser,
      token,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find({}).populate("userId");
    res.json({ messages, success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});
