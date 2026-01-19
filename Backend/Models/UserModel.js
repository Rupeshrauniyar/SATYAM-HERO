const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId, // <-- this is important
        ref: "Report",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId, // <-- this is important
        ref: "Report",
      },
    ],
    reports: [
      {
        type: mongoose.Schema.Types.ObjectId, // <-- this is important
        ref: "Report",
        required: true,
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
      default: false,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "gov"],
    },
  },
  { timestamps: true },
);
const User = mongoose.model("User", userSchema);
module.exports = User;
