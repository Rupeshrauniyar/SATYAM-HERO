const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        default: [],
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        default: [],
      },
    ],
    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
        default: [],
      },
    ],
    alerts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GovPost",
        default: [],
      },
    ],
    updates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GovPost",
        default: [],
      },
    ],
    ward_number: {
      type: Number,
      required: false,
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{10,15}$/.test(v); // only digits, length 10-15
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },

    verified: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "gov"],
    },
    profilePicture: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);
const User = mongoose.model("User", userSchema);
module.exports = User;
